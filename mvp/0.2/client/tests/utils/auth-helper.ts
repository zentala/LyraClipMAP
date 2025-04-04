import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../../server/src/prisma/prisma.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

/**
 * Generates a JWT token for testing purposes
 * @param jwtService The NestJS JWT service
 * @param userId The user ID to include in the token
 * @param email The user email to include in the token
 * @returns JWT token string
 */
export function generateJwtToken(
  jwtService: JwtService,
  userId: string,
  email: string = 'test@example.com'
): string {
  return jwtService.sign({
    sub: userId,
    email,
  });
}

/**
 * Creates a test user in the database
 * @param prisma The PrismaService instance
 * @param email User email
 * @param password User password (will be hashed)
 * @param name User name
 * @returns Created user object
 */
export async function createTestUser(
  prisma: PrismaService,
  email: string = 'test@example.com',
  password: string = 'password123',
  name: string = 'Test User'
) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create the user
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
}

/**
 * Logs in a user and returns the auth token
 * @param app The NestJS application instance
 * @param email User email
 * @param password User password
 * @returns Object containing accessToken and refreshToken
 */
export async function loginUser(
  app: INestApplication,
  email: string = 'test@example.com',
  password: string = 'password123'
) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);
  
  return {
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
  };
}

/**
 * Registers a new user and returns the auth token
 * @param app The NestJS application instance
 * @param email User email
 * @param password User password
 * @param name User name
 * @returns Object containing user data and tokens
 */
export async function registerUser(
  app: INestApplication,
  email: string = 'new@example.com',
  password: string = 'password123',
  name: string = 'New User'
) {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, name })
    .expect(201);
  
  return {
    user: response.body.user,
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
  };
}

/**
 * Refreshes an access token using a refresh token
 * @param app The NestJS application instance
 * @param refreshToken The refresh token
 * @returns New access token
 */
export async function refreshToken(
  app: INestApplication,
  refreshToken: string
) {
  const response = await request(app.getHttpServer())
    .post('/auth/refresh')
    .send({ refreshToken })
    .expect(200);
  
  return response.body.accessToken;
}

/**
 * Verifies that a route requires authentication
 * @param app The NestJS application instance
 * @param method HTTP method ('get', 'post', 'put', 'delete')
 * @param url The route URL
 * @param body Request body (for POST and PUT requests)
 */
export async function verifyAuthRequired(
  app: INestApplication,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  body: any = {}
) {
  const req = request(app.getHttpServer())[method](url);
  
  if (method === 'post' || method === 'put') {
    req.send(body);
  }
  
  return req.expect(401);
}

/**
 * Performs an authenticated request
 * @param app The NestJS application instance
 * @param method HTTP method ('get', 'post', 'put', 'delete')
 * @param url The route URL
 * @param token Auth token
 * @param body Request body (for POST and PUT requests)
 */
export function authRequest(
  app: INestApplication,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  token: string,
  body: any = {}
) {
  const req = request(app.getHttpServer())
    [method](url)
    .set('Authorization', `Bearer ${token}`);
  
  if (method === 'post' || method === 'put') {
    req.send(body);
  }
  
  return req;
}