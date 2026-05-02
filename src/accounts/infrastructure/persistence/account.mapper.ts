import { Account } from '../../domain/account.entity';
import { AccountOrmEntity } from './account.orm-entity';

export class AccountMapper {
  static toDomain(ormEntity: AccountOrmEntity): Account {
    return new Account(
      ormEntity.id,
      Number(ormEntity.balance),
      ormEntity.ownerId,
    );
  }

  static toOrm(domainEntity: Account): AccountOrmEntity {
    const ormEntity = new AccountOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.balance = domainEntity.balance;
    ormEntity.ownerId = domainEntity.ownerId;
    return ormEntity;
  }
}
