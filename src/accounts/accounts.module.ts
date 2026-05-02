import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './infrastructure/controllers/accounts.controller';
import { WithdrawMoneyService } from './application/withdraw-money.service';
import { AccountOrmEntity } from './infrastructure/persistence/account.orm-entity';
import { TypeOrmAccountRepository } from './infrastructure/persistence/typeorm-account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AccountOrmEntity])],
  controllers: [AccountsController],
  providers: [
    WithdrawMoneyService,
    {
      provide: 'ACCOUNT_REPOSITORY',
      useClass: TypeOrmAccountRepository,
    },
  ],
})
export class AccountsModule {}
