import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WithdrawMoneyService } from '../../application/withdraw-money.service';
import { AccountNotFoundException } from '../../domain/exceptions/account-not-found.exception';
import { InsufficientFundsException } from '../../domain/exceptions/insufficient-funds.exception';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly withdrawMoneyService: WithdrawMoneyService) {}

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
