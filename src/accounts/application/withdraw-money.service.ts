import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import type { AccountRepository } from '../domain/account.repository.interface';
import { AccountNotFoundException } from '../domain/exceptions/account-not-found.exception';
import { MoneyWithdrawnEvent } from './events/money-withdrawn.event';
import { AccountMapper } from '../infrastructure/persistence/account.mapper';
import { TransactionOrmEntity } from '../infrastructure/persistence/transaction.orm-entity';
import { AccountOrmEntity } from '../infrastructure/persistence/account.orm-entity';

@Injectable()
export class WithdrawMoneyService {
  private readonly logger = new Logger(WithdrawMoneyService.name);

  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private readonly repository: AccountRepository,
    @Inject('KAFKA_CLIENT')
    private readonly client: ClientKafka,
    private readonly dataSource: DataSource,
  ) {}

  async execute(accountId: string, amount: number): Promise<void> {
    const account = await this.repository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundException(accountId);
    }

    account.withdraw(amount);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Descuenta el balance de la cuenta
      const accountOrm = AccountMapper.toOrm(account);
      await queryRunner.manager.save(AccountOrmEntity, accountOrm);

      // SIMULACIÓN DE ERROR (Para probar el Rollback ACID)
      /* throw new Error(
        'Fallo inesperado al conectar con el procesador de transacciones',
      );*/

      // 2. Guarda el log en la tabla Transaction
      const transaction = new TransactionOrmEntity();
      transaction.accountId = accountId;
      transaction.type = 'WITHDRAW';
      transaction.amount = amount;

      await queryRunner.manager.save(TransactionOrmEntity, transaction);

      // 3. Si ambos tienen éxito, la transacción se confirma (Commit)
      await queryRunner.commitTransaction();
    } catch (err) {
      // Si ocurre un error, revertimos todos los cambios
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction failed, rolling back...', err);
      throw err;
    } finally {
      // Siempre debemos liberar el queryRunner
      await queryRunner.release();
    }

    const event = new MoneyWithdrawnEvent(accountId, amount);

    try {
      // 4. Kafka es un sistema externo, el evento debe ir DESPUÉS del commit de la BD
      this.client.emit('money.withdrawn', event).subscribe({
        next: () => console.log('✅ Evento enviado a Kafka con éxito'),
        error: (err) => console.error('❌ Error enviando a Kafka:', err),
      });
    } catch (error) {
      this.logger.error('Kafka unreachable, event queued for retry', error);
    }
  }
}
