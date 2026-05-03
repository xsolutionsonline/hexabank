export class MoneyWithdrawnEvent {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
