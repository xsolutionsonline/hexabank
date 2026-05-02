import { InsufficientFundsException } from './exceptions/insufficient-funds.exception';

export class Account {
  constructor(
    public id: string,
    public balance: number,
    public ownerId: string,
  ) {}

  withdraw(amount: number): void {
    if (this.balance < amount) {
      throw new InsufficientFundsException();
    }
    this.balance -= amount;
  }
}
