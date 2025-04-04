import { Test } from '@nestjs/testing';
import { AuthController } from '../../../server/src/auth/auth.controller';
import { AuthService } from '../../../server/src/auth/auth.service';
import { JwtAuthGuard } from '../../../server/src/auth/guards/jwt-auth.guard';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

// Mock AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<AuthController>(AuthController);
    service = moduleRef.get<AuthService>(AuthService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };
      
      const expectedResult = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: 'user-id-1',
          email: registerDto.email,
          name: registerDto.name,
        },
      };
      
      service.register.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
      };
      
      service.register.mockRejectedValue(new ConflictException('Email already exists'));

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials and return tokens', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };
      
      const expectedResult = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: 'user-id-1',
          email: loginDto.email,
          name: 'Test User',
        },
      };
      
      service.login.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };
      
      service.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refreshToken', () => {
    it('should generate a new access token with valid refresh token', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };
      
      const expectedResult = {
        accessToken: 'new-access-token',
      };
      
      service.refreshToken.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.refreshToken(refreshTokenDto);

      // Assert
      expect(result).toBe(expectedResult);
      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };
      
      service.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      // Act & Assert
      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      // Arrange
      const user = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      // Act
      const result = controller.getProfile(user);

      // Assert
      expect(result).toBe(user);
    });
  });
});