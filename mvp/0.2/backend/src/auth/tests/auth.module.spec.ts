import { Test, TestingModule } from '@nestjs/test';
import { AuthModule } from '../auth.module';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });

  it('should provide AuthController', () => {
    const controller = module.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
  });

  it('should provide JwtService', () => {
    const service = module.get<JwtService>(JwtService);
    expect(service).toBeDefined();
  });

  it('should provide ConfigService', () => {
    const service = module.get<ConfigService>(ConfigService);
    expect(service).toBeDefined();
  });

  it('should provide PrismaService', () => {
    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });
}); 