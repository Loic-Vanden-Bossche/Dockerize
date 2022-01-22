import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { Role } from '../../roles/role.model';
import { User } from '../../user/user.model';

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(private readonly key: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    const isAdmin = user.roles.some(
      (userRole: Role) => userRole.name === 'admin',
    );

    if (isAdmin) {
      return true;
    }

    const requestId = request.params[this.key];
    const userId = user.email;

    return requestId != null && userId != null && requestId === userId;
  }
}
