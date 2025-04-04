import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserAlreadyExistsException, InvalidCredentialsException } from '../exceptions/auth.exceptions';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    it('should register a new user successfully', async () => {
      const expectedResult = { access_token: 'token' };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw UserAlreadyExistsException if user exists', async () => {
      mockAuthService.register.mockRejectedValue(new UserAlreadyExistsException());

      await expect(controller.register(registerDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      const expectedResult = { access_token: 'token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw InvalidCredentialsException if credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(new InvalidCredentialsException());

      await expect(controller.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const token = 'Bearer old-token';
      const expectedResult = { access_token: 'new-token' };
      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(token);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('old-token');
    });

    it('should throw UnauthorizedException if no token provided', async () => {
      const token = '';

      await expect(controller.refresh(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'Bearer invalid-token';
      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException());

      await expect(controller.refresh(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 