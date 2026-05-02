export class Account {
  constructor(
    public id: string,
    public balance: number,
    public ownerId: string,
  ) {}

  withdraw(amount: number): void {
    if (this.balance >= amount) {
      this.balance -= amount;
    }
  }
}
