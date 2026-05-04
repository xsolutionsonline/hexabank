import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccountOrmEntity } from './account.orm-entity';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // Ej: "WITHDRAW", "DEPOSIT"

  @Column('numeric', { precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => AccountOrmEntity, (account) => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: AccountOrmEntity;
}
