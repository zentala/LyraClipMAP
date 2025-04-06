import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get('JWT_SECRET');
    console.log('JwtStrategy constructor - Environment:', process.env.NODE_ENV);
    console.log('JwtStrategy constructor - JWT Secret:', secret);
    console.log('JwtStrategy constructor - Config Service:', {
      allEnv: configService.get('JWT_SECRET'),
      processEnv: process.env.JWT_SECRET,
    });
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256']
    });
  }

  async validate(payload: any) {
    console.log('JwtStrategy validate - Payload:', payload);
    console.log('JwtStrategy validate - Current Environment:', process.env.NODE_ENV);
    console.log('JwtStrategy validate - Current JWT Secret:', this.configService.get('JWT_SECRET'));
    
    if (!payload.sub || !payload.role) {
      console.error('JwtStrategy validate - Invalid payload structure:', payload);
      return null;
    }
    
    return {
      id: payload.sub,
      role: payload.role,
      type: payload.type
    };
  }
} 