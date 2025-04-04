import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthValidator {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  validateUsername(username: string): boolean {
    return username.length >= 3;
  }

  validateRegisterDto(dto: RegisterDto): boolean {
    return (
      this.validateEmail(dto.email) &&
      this.validatePassword(dto.password) &&
      this.validateUsername(dto.username)
    );
  }

  validateLoginDto(dto: LoginDto): boolean {
    return this.validateEmail(dto.email) && this.validatePassword(dto.password);
  }
} 