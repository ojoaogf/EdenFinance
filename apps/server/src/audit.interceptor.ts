import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url?: string;
      ip?: string;
      user?: { userId?: string; email?: string };
    }>();
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Audita somente chamadas autenticadas para reduzir ruído.
        if (!request.user?.userId) {
          return;
        }

        const durationMs = Date.now() - startedAt;
        const path = request.originalUrl ?? request.url ?? '';
        const userEmail = request.user.email ?? 'unknown';
        const userId = request.user.userId ?? 'unknown';

        this.logger.log(
          `${request.method} ${path} status=${response.statusCode} user=${userEmail} userId=${userId} ip=${request.ip ?? 'unknown'} durationMs=${durationMs}`,
        );
      }),
    );
  }
}
