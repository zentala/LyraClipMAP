import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract user data from request object
 * 
 * Can be used in two ways:
 * 1. @User() - returns entire user object
 * 2. @User('id') - returns specific property of user object (e.g. id)
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Return the whole user object if no specific property is provided
    return data ? user?.[data] : user;
  },
); 