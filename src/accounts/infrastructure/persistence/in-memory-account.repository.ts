import { Injectable } from '@nestjs/common';
import type { AccountRepository } from '../../domain/account.repository.interface';
import { Account } from '../../domain/account.entity';

@Injectable()
export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Account[] = [
    new Account('123', 100, 'owner-1') // Cuenta inicial para poder probar
  ];

  async save(account: Account): Promise<void> {
    const index = this.accounts.findIndex((a) => a.id === account.id);
    if (index >= 0) {
      this.accounts[index] = account;
    } else {
      this.accounts.push(account);
    }
  }

  async findById(id: string): Promise<Account | null> {
    const account = this.accounts.find((a) => a.id === id);
    // Clone the account to simulate database retrieval and avoid mutating the reference directly
    return account ? new Account(account.id, account.balance, account.ownerId) : null;
  }
}
