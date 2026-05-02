import { Module } from '@nestjs/common';
import { AccountsController } from './infrastructure/controllers/accounts.controller';
import { WithdrawMoneyService } from './application/withdraw-money.service';
import { InMemoryAccountRepository } from './infrastructure/persistence/in-memory-account.repository';

@Module({
  controllers: [AccountsController],
  providers: [
    WithdrawMoneyService,
    {
      provide: 'ACCOUNT_REPOSITORY',
      useClass: InMemoryAccountRepository,
    },
  ],
})
export class AccountsModule {}
