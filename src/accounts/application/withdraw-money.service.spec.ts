import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { WithdrawMoneyService } from './withdraw-money.service';
import { Account } from '../domain/account.entity';
import { AccountNotFoundException } from '../domain/exceptions/account-not-found.exception';
import { InsufficientFundsException } from '../domain/exceptions/insufficient-funds.exception';
import { of } from 'rxjs';

describe('WithdrawMoneyService', () => {
  let service: WithdrawMoneyService;

  const mockAccountRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockKafkaClient = {
    emit: jest.fn().mockReturnValue(of({})), // Simula un Observable exitoso
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawMoneyService,
        {
          provide: 'ACCOUNT_REPOSITORY',
          useValue: mockAccountRepository,
        },
        {
          provide: 'KAFKA_CLIENT',
          useValue: mockKafkaClient,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WithdrawMoneyService>(WithdrawMoneyService);

    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    // Caso de Prueba 1 y Caso de Prueba 3
    it('Debe restar el dinero si hay balance suficiente y realizar el save 1 vez (Commit)', async () => {
      // Arrange
      const accountId = 'account-123';
      const initialBalance = 100;
      const withdrawAmount = 50;
      const account = new Account(accountId, initialBalance, 'user-123');

      mockAccountRepository.findById.mockResolvedValue(account);

      // Act
      await service.execute(accountId, withdrawAmount);

      // Assert:
      // 1. Descontó el balance en la entidad de negocio
      expect(account.balance).toBe(initialBalance - withdrawAmount);

      // 2. Se llamó a manager.save exactamente dos veces (una para cuenta y otra para transacción)
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2);

      // 3. Se confirmó la transacción
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();

      // 4. Se emitió el evento a Kafka después de todo el bloque
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        'money.withdrawn',
        expect.any(Object),
      );
    });

    // Caso de Prueba 2
    it('Debe lanzar InsufficientFundsException si el balance es insuficiente', async () => {
      // Arrange
      const accountId = 'account-123';
      const initialBalance = 10;
      const withdrawAmount = 50;
      const account = new Account(accountId, initialBalance, 'user-123');

      mockAccountRepository.findById.mockResolvedValue(account);

      // Act & Assert
      await expect(service.execute(accountId, withdrawAmount)).rejects.toThrow(
        InsufficientFundsException,
      );

      // Validamos que no se hayan iniciado transacciones
      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('Debe lanzar AccountNotFoundException si la cuenta no existe', async () => {
      // Arrange
      const accountId = 'non-existent-id';
      const withdrawAmount = 50;

      mockAccountRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(accountId, withdrawAmount)).rejects.toThrow(
        AccountNotFoundException,
      );
      
      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });
  });
});
