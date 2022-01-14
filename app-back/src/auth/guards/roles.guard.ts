import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { Role } from '../../roles/role.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly roles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.roles;
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = () =>
      user.roles.some((userRole: Role) =>
        requiredRoles.includes(userRole.name),
      );

    return user && user.roles && hasRole();
  }
}
