import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('RolesGuard - Required roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('RolesGuard - No roles required, allowing access');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('RolesGuard - User from request:', user);

    if (!user) {
      console.error('RolesGuard - No user found in request');
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    console.log('RolesGuard - User has required role:', hasRole);

    return hasRole;
  }
} 