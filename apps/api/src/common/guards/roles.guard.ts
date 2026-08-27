import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_MESSAGES } from '@repo/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      string[] | undefined
    >('roles', [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const hasRole = user.role && requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    return true;
  }
}
