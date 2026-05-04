import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Entity('accounts')
export class AccountOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;

  @Column()
  ownerId: string;

  @OneToMany(() => TransactionOrmEntity, (transaction) => transaction.account)
  transactions: TransactionOrmEntity[];
}
