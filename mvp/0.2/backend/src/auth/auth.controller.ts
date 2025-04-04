import { Controller, Post, Body, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.authService.refreshToken(token);
  }
} 