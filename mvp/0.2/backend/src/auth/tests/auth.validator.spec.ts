import { Test, TestingModule } from '@nestjs/test';
import { AuthValidator } from '../validators/auth.validator';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

describe('AuthValidator', () => {
  let validator: AuthValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthValidator],
    }).compile();

    validator = module.get<AuthValidator>(AuthValidator);
  });

  it('should be defined', () => {
    expect(validator).toBeDefined();
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validator.validateEmail('test@example.com')).toBe(true);
      expect(validator.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(validator.validateEmail('invalid-email')).toBe(false);
      expect(validator.validateEmail('test@')).toBe(false);
      expect(validator.validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', () => {
      expect(validator.validatePassword('password123')).toBe(true);
      expect(validator.validatePassword('123456')).toBe(true);
    });

    it('should return false for invalid password', () => {
      expect(validator.validatePassword('123')).toBe(false);
      expect(validator.validatePassword('')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should return true for valid username', () => {
      expect(validator.validateUsername('testuser')).toBe(true);
      expect(validator.validateUsername('user123')).toBe(true);
    });

    it('should return false for invalid username', () => {
      expect(validator.validateUsername('ab')).toBe(false);
      expect(validator.validateUsername('')).toBe(false);
    });
  });

  describe('validateRegisterDto', () => {
    it('should return true for valid register dto', () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      expect(validator.validateRegisterDto(dto)).toBe(true);
    });

    it('should return false for invalid register dto', () => {
      const invalidDto: RegisterDto = {
        email: 'invalid-email',
        password: '123',
        username: 'ab',
      };

      expect(validator.validateRegisterDto(invalidDto)).toBe(false);
    });
  });

  describe('validateLoginDto', () => {
    it('should return true for valid login dto', () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(validator.validateLoginDto(dto)).toBe(true);
    });

    it('should return false for invalid login dto', () => {
      const invalidDto: LoginDto = {
        email: 'invalid-email',
        password: '123',
      };

      expect(validator.validateLoginDto(invalidDto)).toBe(false);
    });
  });
}); 