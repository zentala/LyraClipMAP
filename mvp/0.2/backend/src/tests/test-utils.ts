import { INestApplication } from '@nestjs/common';
import { AuthTestHelper } from './auth-test.helper';
import { DbTestHelper } from './db-test.helper';
import { UserRole } from '@prisma/client';

export interface TestDataTracking {
  iteration: number;
  createdAt: Date;
  entities: {
    adminUser?: number;
    regularUser?: number;
    artist?: number;
    lyrics?: number;
    song?: number;
  }
}

export class TestUtils {
  private static testDataHistory: TestDataTracking[] = [];

  static trackTestData(data: any) {
    this.testDataHistory.push({
      iteration: this.testDataHistory.length + 1,
      createdAt: new Date(),
      entities: {
        adminUser: data.adminUser?.id,
        regularUser: data.regularUser?.id,
        artist: data.artist?.id,
        lyrics: data.lyrics?.id,
        song: data.song?.id
      }
    });
  }

  static getTestHistory() {
    return this.testDataHistory;
  }

  static clearTestHistory() {
    this.testDataHistory = [];
  }

  static withAuth(request: any, token: string) {
    if (!token) {
      console.warn('Warning: Attempting to set auth header with undefined token');
      return request;
    }
    return request.set('Authorization', `Bearer ${token}`);
  }

  static async setupTestAuth(app: INestApplication, role: UserRole = 'USER') {
    const authHelper = app.get(AuthTestHelper);
    const result = await authHelper.setupTestAuth(role);
    console.log(`Test auth setup completed for role ${role}:`, {
      userId: result.user.id,
      token: result.token?.substring(0, 20) + '...'
    });
    return result;
  }

  static async setupTestDatabase(app: INestApplication) {
    const dbHelper = app.get(DbTestHelper);
    await dbHelper.resetDatabase();
    console.log('Test database reset completed');
  }

  static async debugTestSetup(app: INestApplication, testData: any) {
    const authHelper = app.get(AuthTestHelper);
    const validation = await authHelper.validateTestSetup();
    const configService = app.get('ConfigService');

    console.log('Test Setup State:', {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        jwtSecret: process.env.JWT_SECRET?.substring(0, 10) + '...',
        configJwtSecret: configService.get('JWT_SECRET')?.substring(0, 10) + '...'
      },
      testData: {
        adminUser: testData.adminUser?.id,
        regularUser: testData.regularUser?.id,
        artist: testData.artist?.id,
        lyrics: testData.lyrics?.id,
        song: testData.song?.id
      },
      jwt: {
        validation,
        adminToken: testData.adminToken?.substring(0, 20) + '...',
        userToken: testData.userToken?.substring(0, 20) + '...'
      },
      testHistory: this.testDataHistory
    });
  }

  static async validateRequest(request: any, token?: string) {
    console.log('Request validation:', {
      method: request.method,
      url: request.url,
      headers: {
        ...request.headers,
        authorization: token ? `Bearer ${token.substring(0, 20)}...` : undefined
      },
      body: request.body
    });
  }
}
