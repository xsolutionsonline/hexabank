import { Injectable, Inject } from '@nestjs/common';
import type { AccountRepository } from '../domain/account.repository.interface';
import { AccountNotFoundException } from '../domain/exceptions/account-not-found.exception';

@Injectable()
export class GetAccountBalanceService {
  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private readonly repository: AccountRepository,
  ) {}

  async execute(accountId: string): Promise<number> {
    const account = await this.repository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundException(accountId);
    }

    return account.getBalance();
  }
}
