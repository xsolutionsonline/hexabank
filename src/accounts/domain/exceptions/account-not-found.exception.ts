export class AccountNotFoundException extends Error {
    constructor(id: string) {
        super(`Account with ID ${id} not found`);
        this.name = 'AccountNotFoundException';
    }
}
