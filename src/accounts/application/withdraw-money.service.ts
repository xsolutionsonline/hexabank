import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import type { AccountRepository } from '../domain/account.repository.interface';
import { AccountNotFoundException } from '../domain/exceptions/account-not-found.exception';
import { MoneyWithdrawnEvent } from './events/money-withdrawn.event';

@Injectable()
export class WithdrawMoneyService {
  private readonly logger = new Logger(WithdrawMoneyService.name);

  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private readonly repository: AccountRepository,
    @Inject('KAFKA_CLIENT')
    private readonly client: ClientKafka,
  ) {}

  async execute(accountId: string, amount: number): Promise<void> {
    const account = await this.repository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundException(accountId);
    }

    account.withdraw(amount);

    // 1. La verdad queda escrita en piedra (DB)
    await this.repository.save(account);

    const event = new MoneyWithdrawnEvent(accountId, amount);

    try {
      // 2. Intentamos avisar al mundo
      this.client.emit('money.withdrawn', event).subscribe({
        next: () => console.log('✅ Evento enviado a Kafka con éxito'),
        error: (err) => console.error('❌ Error enviando a Kafka:', err),
      });
    } catch (error) {
      // 3. Kafka es opcional para la respuesta al cliente
      this.logger.error('Kafka unreachable, event queued for retry', error);
    }
  }
}
