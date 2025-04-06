import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('JwtAuthGuard - Environment:', process.env.NODE_ENV);
    console.log('JwtAuthGuard - JWT Secret:', this.configService.get('JWT_SECRET'));

    // First call the parent's canActivate to handle Passport authentication
    const parentResult = await super.canActivate(context);
    if (!parentResult) {
      console.log('JwtAuthGuard - Parent canActivate returned false');
      return false;
    }

    const request = context.switchToHttp().getRequest();
    console.log('JwtAuthGuard - Request headers:', request.headers);

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('JwtAuthGuard - No Bearer token found in Authorization header');
      return false;
    }

    const token = authHeader.substring(7);
    console.log('JwtAuthGuard - Extracted token:', token);

    try {
      const secret = this.configService.get('JWT_SECRET');
      console.log('JwtAuthGuard - Using secret:', secret);
      
      const decoded = this.jwtService.decode(token);
      console.log('JwtAuthGuard - Decoded token:', decoded);
      
      const verified = await this.jwtService.verifyAsync(token, {
        secret: secret,
        algorithms: ['HS256']
      });
      console.log('JwtAuthGuard - Verified token:', verified);
      
      request.user = verified;
      return true;
    } catch (error) {
      console.error('JwtAuthGuard - Token validation error:', error.message);
      return false;
    }
  }
} 