import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const module = req.route?.path?.split('/')[1] || 'unknown';
    const action = `${req.method} ${req.route?.path}`;

    return next.handle().pipe(
      tap((data) => {
        if (user) {
          this.auditService.log(user.id, module, action, {
            body: req.body,
            params: req.params,
          });
        }
      }),
    );
  }
}
