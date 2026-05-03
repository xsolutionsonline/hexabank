import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { AccountRepository } from '../domain/account.repository.interface';
import { Account } from '../domain/account.entity';

@Injectable()
export class CreateAccountService {
  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private readonly repository: AccountRepository,
  ) {}

  async execute(ownerId: string, initialBalance: number = 0): Promise<Account> {
    const id = uuidv4();
    const account = new Account(id, initialBalance, ownerId);
    
    await this.repository.save(account);
    return account;
  }
}
