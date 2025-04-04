import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Sprawdź czy użytkownik już istnieje
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Sprawdź czy username jest już zajęte
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hashuj hasło
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Utwórz użytkownika
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        username: registerDto.username,
      },
    });

    // Wygeneruj token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: this.configService.get('JWT_SECRET') },
    );

    return { access_token: token };
  }

  async login(loginDto: LoginDto) {
    // Znajdź użytkownika
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Wygeneruj token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: this.configService.get('JWT_SECRET') },
    );

    return { access_token: token };
  }

  async refreshToken(token: string) {
    try {
      // Zweryfikuj token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Wygeneruj nowy token
      const newToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { secret: this.configService.get('JWT_SECRET') },
      );

      return { access_token: newToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 