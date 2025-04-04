import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthPipe implements PipeTransform {
  transform(value: RegisterDto | LoginDto) {
    if (!value) {
      throw new BadRequestException('No data provided');
    }

    if ('email' in value && !value.email) {
      throw new BadRequestException('Email is required');
    }

    if ('password' in value && !value.password) {
      throw new BadRequestException('Password is required');
    }

    if ('username' in value && !value.username) {
      throw new BadRequestException('Username is required');
    }

    return value;
  }
} 