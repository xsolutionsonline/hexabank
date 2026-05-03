import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountsController } from './infrastructure/controllers/accounts.controller';
import { WithdrawMoneyService } from './application/withdraw-money.service';
import { AccountOrmEntity } from './infrastructure/persistence/account.orm-entity';
import { TypeOrmAccountRepository } from './infrastructure/persistence/typeorm-account.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountOrmEntity]),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'accounts-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'accounts-consumer',
          },
        },
      },
    ]),
  ],
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
