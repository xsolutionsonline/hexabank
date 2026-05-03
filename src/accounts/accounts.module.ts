import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountsController } from './infrastructure/controllers/accounts.controller';
import { WithdrawMoneyService } from './application/withdraw-money.service';
import { GetAccountBalanceService } from './application/get-account-balance.service';
import { CreateAccountService } from './application/create-account.service';
import { AccountOrmEntity } from './infrastructure/persistence/account.orm-entity';
import { TypeOrmAccountRepository } from './infrastructure/persistence/typeorm-account.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountOrmEntity]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get<string>(
                'KAFKA_CLIENT_ID',
                'accounts-service',
              ),
              brokers: [
                configService.get<string>('KAFKA_BROKERS', 'localhost:9092'),
              ],
            },
            consumer: {
              groupId: configService.get<string>(
                'KAFKA_CONSUMER_GROUP_ID',
                'accounts-consumer',
              ),
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AccountsController],
  providers: [
    WithdrawMoneyService,
    GetAccountBalanceService,
    CreateAccountService,
    {
      provide: 'ACCOUNT_REPOSITORY',
      useClass: TypeOrmAccountRepository,
    },
  ],
})
export class AccountsModule {}
