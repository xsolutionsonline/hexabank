import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AccountRepository } from '../../domain/account.repository.interface';
import { Account } from '../../domain/account.entity';
import { AccountOrmEntity } from './account.orm-entity';
import { AccountMapper } from './account.mapper';

@Injectable()
export class TypeOrmAccountRepository implements AccountRepository {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly repository: Repository<AccountOrmEntity>,
  ) {}

  async save(account: Account): Promise<void> {
    const ormEntity = AccountMapper.toOrm(account);
    await this.repository.save(ormEntity);
  }

  async findById(id: string): Promise<Account | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });

    if (!ormEntity) {
      return null;
    }

    return AccountMapper.toDomain(ormEntity);
  }
}
