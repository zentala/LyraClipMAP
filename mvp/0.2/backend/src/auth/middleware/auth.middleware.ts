import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    if (!auth) {
      throw new UnauthorizedException('No token provided');
    }

    const [type, token] = auth.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid token type');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 