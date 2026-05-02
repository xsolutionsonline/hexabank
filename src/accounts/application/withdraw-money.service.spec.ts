import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawMoneyService } from './withdraw-money.service';
import { Account } from '../domain/account.entity';
import { AccountNotFoundException } from '../domain/exceptions/account-not-found.exception';

describe('WithdrawMoneyService', () => {
  let service: WithdrawMoneyService;

  const mockAccountRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawMoneyService,
        {
          provide: 'ACCOUNT_REPOSITORY',
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<WithdrawMoneyService>(WithdrawMoneyService);

    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should withdraw money and save the account if it exists (Success Case)', async () => {
      // Arrange (Preparar)
      const accountId = '123';
      const initialBalance = 100;
      const withdrawAmount = 50;
      const account = new Account(accountId, initialBalance, 'owner1');

      mockAccountRepository.findById.mockResolvedValue(account);

      // Act (Ejecutar)
      await service.execute(accountId, withdrawAmount);

      // Assert (Verificar)
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(account.balance).toBe(initialBalance - withdrawAmount);
      expect(mockAccountRepository.save).toHaveBeenCalledWith(account);
      expect(mockAccountRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw AccountNotFoundException and NOT save if account does not exist (Failure Case)', async () => {
      // Arrange (Preparar)
      const accountId = 'non-existent-id';
      const withdrawAmount = 50;

      mockAccountRepository.findById.mockResolvedValue(null);

      // Act & Assert (Ejecutar y Verificar)
      await expect(service.execute(accountId, withdrawAmount)).rejects.toThrow(
        AccountNotFoundException,
      );

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId);
      expect(mockAccountRepository.save).not.toHaveBeenCalled();
    });
  });
});
