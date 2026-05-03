import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WithdrawMoneyService } from '../../application/withdraw-money.service';
import { GetAccountBalanceService } from '../../application/get-account-balance.service';
import { CreateAccountService } from '../../application/create-account.service';
import { AccountNotFoundException } from '../../domain/exceptions/account-not-found.exception';
import { InsufficientFundsException } from '../../domain/exceptions/insufficient-funds.exception';
import { WithdrawDto } from './dto/withdraw.dto';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly withdrawMoneyService: WithdrawMoneyService,
    private readonly getAccountBalanceService: GetAccountBalanceService,
    private readonly createAccountService: CreateAccountService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      const account = await this.createAccountService.execute(
        createAccountDto.ownerId,
        createAccountDto.initialBalance,
      );
      return account;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get(':id/balance')
  @HttpCode(HttpStatus.OK)
  async getBalance(@Param('id') id: string) {
    try {
      const balance = await this.getAccountBalanceService.execute(id);
      return { balance };
    } catch (error) {
      if (error instanceof AccountNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @Param('id') id: string,
    @Body() withdrawDto: WithdrawDto,
  ): Promise<void> {
    try {
      await this.withdrawMoneyService.execute(id, withdrawDto.amount);
    } catch (error) {
      if (error instanceof AccountNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof InsufficientFundsException) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
