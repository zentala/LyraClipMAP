import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../../../server/src/auth/guards/jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../server/src/auth/decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for public routes', async () => {
      // Arrange
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
    });

    it('should call super.canActivate for protected routes', async () => {
      // Arrange
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
      
      // Mock the super.canActivate method
      const canActivateSpy = jest.spyOn(JwtAuthGuard.prototype as any, 'canActivate');
      canActivateSpy.mockImplementation(() => true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
      expect(canActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
      
      // Restore the original implementation
      canActivateSpy.mockRestore();
    });

    it('should handle authentication errors', async () => {
      // Arrange
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
      
      // Mock the super.canActivate method to throw an error
      const canActivateSpy = jest.spyOn(JwtAuthGuard.prototype as any, 'canActivate');
      canActivateSpy.mockImplementation(() => {
        throw new Error('Auth error');
      });

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
      
      // Restore the original implementation
      canActivateSpy.mockRestore();
    });
  });
});