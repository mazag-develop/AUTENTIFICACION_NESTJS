import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const cookieToken = req.cookies?.['access_token'];
    const headerToken = req.headers['authorization'];

    if (!headerToken && cookieToken) req.headers.authorization = `Bearer ${cookieToken}`;
    return req;
  }
}