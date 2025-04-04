import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: UserRole.USER },
          }),
        }),
      } as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: UserRole.ADMIN },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: UserRole.USER },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should return false if user has no role', () => {
      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: {},
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });
  });
}); 