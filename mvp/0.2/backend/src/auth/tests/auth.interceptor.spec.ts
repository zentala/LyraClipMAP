import { Test, TestingModule } from '@nestjs/test';
import { ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthInterceptor],
    }).compile();

    interceptor = module.get<AuthInterceptor>(AuthInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    let mockContext: ExecutionContext;
    let mockCallHandler: CallHandler;

    beforeEach(() => {
      mockContext = {} as ExecutionContext;
      mockCallHandler = {
        handle: () => of({}),
      };
    });

    it('should pass through successful responses', (done) => {
      const data = { test: 'data' };
      mockCallHandler.handle = () => of(data);

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (value) => {
          expect(value).toEqual(data);
          done();
        },
      });
    });

    it('should handle UnauthorizedException', (done) => {
      const error = new UnauthorizedException('Invalid token');
      mockCallHandler.handle = () => throwError(() => error);

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(UnauthorizedException);
          expect(err.message).toBe('Invalid token');
          done();
        },
      });
    });

    it('should pass through other errors', (done) => {
      const error = new Error('Other error');
      mockCallHandler.handle = () => throwError(() => error);

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Other error');
          done();
        },
      });
    });
  });
}); 