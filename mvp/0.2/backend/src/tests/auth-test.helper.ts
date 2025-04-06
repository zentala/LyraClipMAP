import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthTestHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async setupTestAuth(role: UserRole = 'USER') {
    const user = await this.createTestUser(role);
    const token = await this.generateToken(user);
    return { user, token };
  }

  async createTestUser(role: UserRole = 'USER') {
    const hashedPassword = await bcrypt.hash('test123', 10);
    return this.prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        username: `test-user-${Date.now()}`,
        password: hashedPassword,
        role,
        preferences: {
          create: {
            theme: 'light',
            language: 'en',
            notifications: true
          }
        }
      },
      include: {
        preferences: true
      }
    });
  }

  async generateToken(user: any) {
    try {
      const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role 
      };
      return this.jwtService.sign(payload);
    } catch (error) {
      console.error('Token generation failed:', error);
      throw error;
    }
  }

  async validateTestSetup() {
    try {
      const testUser = await this.createTestUser();
      const token = await this.generateToken(testUser);
      const decoded = this.jwtService.verify(token);
      
      return {
        success: true,
        userId: testUser.id,
        tokenValid: !!decoded,
        decodedSub: decoded.sub
      };
    } catch (error) {
      console.error('Test setup validation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanupTestUsers() {
    try {
      const result = await this.prisma.user.deleteMany({
        where: {
          email: {
            contains: 'test-'
          }
        }
      });
      console.log(`Cleaned up ${result.count} test users`);
      return result;
    } catch (error) {
      console.error('Test user cleanup failed:', error);
      throw error;
    }
  }
}
