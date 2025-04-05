import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('JwtAuthGuard - Request headers:', request.headers);
    
    try {
      const result = await super.canActivate(context);
      console.log('JwtAuthGuard - Token validation result:', result);
      return result as boolean;
    } catch (error) {
      console.error('JwtAuthGuard - Token validation error:', error.message);
      throw error;
    }
  }
} 