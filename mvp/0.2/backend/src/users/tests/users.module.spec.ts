import { Test } from '@nestjs/testing';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock AuthGuard
const mockAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  UseGuards: () => () => {},
}));

describe('UsersModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should provide UsersService', async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    const service = module.get<UsersService>(UsersService);
    expect(service).toBeDefined();
  });

  it('should provide PrismaService', async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    const service = module.get<PrismaService>(PrismaService);
    expect(service).toBeDefined();
  });
}); 