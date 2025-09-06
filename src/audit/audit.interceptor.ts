import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const user = req.user || null; // puede no existir en rutas públicas
    const path = req.route?.path || req.url || 'unknown';
    const module = path.split('/')[1] || 'unknown';
    const action = `${req.method} ${path}`;

    // Captura completa del request
    const logData = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      cookies: req.cookies,
      ip: req.ip,
    };

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        // Logging asíncrono
        this.auditService.log(
          user?.id || 'anon',
          module,
          action,
          { ...logData, duration }
        );
      }),
    );
  }
}
