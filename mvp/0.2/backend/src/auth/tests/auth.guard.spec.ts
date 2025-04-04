import { Test, TestingModule } from '@nestjs/test';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    const mockRequest = {
      headers: {},
    };

    beforeEach(() => {
      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;
    });

    it('should throw UnauthorizedException if no authorization header', async () => {
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
      mockRequest.headers.authorization = 'Basic token';

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should set user in request and return true if token is valid', async () => {
      const token = 'valid-token';
      const payload = { sub: 1, email: 'test@example.com' };
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockJwtService.verify.mockReturnValue(payload);
      mockConfigService.get.mockReturnValue('secret');

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'secret',
      });
    });
  });
}); 