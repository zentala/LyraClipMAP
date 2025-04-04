import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../../server/src/auth/auth.service';
import { UsersService } from '../../../server/src/users/users.service';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock services
jest.mock('bcrypt');

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

// Mock UsersService
class MockUsersService {
  findByEmail = jest.fn();
  findById = jest.fn();
  create = jest.fn();
  update = jest.fn();
}

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: MockUsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useClass: MockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default configuration values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        'jwt.secret': 'test-secret',
        'jwt.expiration': '1h',
        'jwt.refreshExpiration': '7d',
      };
      return config[key];
    });
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };
      
      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: 'user-id-1',
        email: registerDto.email,
        name: registerDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: mockUser,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
      };
      
      usersService.findByEmail.mockResolvedValue({
        id: 'existing-user-id',
        email: registerDto.email,
      });

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials and return tokens', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };
      
      const mockUser = {
        id: 'user-id-1',
        email: loginDto.email,
        password: 'hashed-password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce(accessToken).mockReturnValueOnce(refreshToken);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };
      
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };
      
      const mockUser = {
        id: 'user-id-1',
        email: loginDto.email,
        password: 'hashed-password',
        name: 'Test User',
      };
      
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should generate a new access token with valid refresh token', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };
      
      const decodedToken = {
        sub: 'user-id-1',
        email: 'test@example.com',
      };
      
      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      const newAccessToken = 'new-access-token';
      
      jwtService.verify.mockReturnValue(decodedToken);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(newAccessToken);

      // Act
      const result = await authService.refreshToken(refreshTokenDto);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(usersService.findById).toHaveBeenCalledWith(decodedToken.sub);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        accessToken: newAccessToken,
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };
      
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };
      
      const decodedToken = {
        sub: 'nonexistent-user-id',
        email: 'test@example.com',
      };
      
      jwtService.verify.mockReturnValue(decodedToken);
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(usersService.findById).toHaveBeenCalledWith(decodedToken.sub);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return a user if valid JWT payload', async () => {
      // Arrange
      const payload = {
        sub: 'user-id-1',
        email: 'test@example.com',
      };
      
      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.validateUser(payload);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const payload = {
        sub: 'nonexistent-user-id',
        email: 'test@example.com',
      };
      
      usersService.findById.mockResolvedValue(null);

      // Act
      const result = await authService.validateUser(payload);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toBeNull();
    });
  });
});