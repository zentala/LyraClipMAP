import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException, ConflictException)
export class AuthFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException | ConflictException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
} 