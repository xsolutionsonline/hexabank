import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('accounts')
export class AccountOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;

  @Column()
  ownerId: string;
}
