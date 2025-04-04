import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'super-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
})); 