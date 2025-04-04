import { UnauthorizedException, ConflictException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid credentials');
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super('User already exists');
  }
}

export class UsernameAlreadyExistsException extends ConflictException {
  constructor() {
    super('Username already exists');
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid token');
  }
}

export class NoTokenProvidedException extends UnauthorizedException {
  constructor() {
    super('No token provided');
  }
}

export class InvalidTokenTypeException extends UnauthorizedException {
  constructor() {
    super('Invalid token type');
  }
} 