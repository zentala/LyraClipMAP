import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { LyricsModule } from './lyrics/lyrics.module';
import { TextContentModule } from './text-content/text-content.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '1d' },
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    LyricsModule,
    TextContentModule,
  ],
})
export class AppModule {} 