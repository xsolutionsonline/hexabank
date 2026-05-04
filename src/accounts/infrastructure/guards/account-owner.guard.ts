import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import type { AccountRepository } from '../../domain/account.repository.interface';
import { Request } from 'express';

@Injectable()
export class AccountOwnerGuard implements CanActivate {
  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private readonly repository: AccountRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accountId = request.params.id as string;

    const headerValue = request.headers['x-user-id'];
    const userId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!userId) {
      throw new ForbiddenException('Missing x-user-id header');
    }

    if (!accountId) {
      return false;
    }

    const account = await this.repository.findById(accountId);

    if (!account) {
      return true;
    }

    if (account.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this account');
    }

    return true;
  }
}
