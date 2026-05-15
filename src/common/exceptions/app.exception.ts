import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    errors?: unknown[],
  ) {
    super({ message, errors }, status);
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HttpStatus.NOT_FOUND);
  }
}

export class ResourceConflictException extends AppException {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class AccessForbiddenException extends AppException {
  constructor(message = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
