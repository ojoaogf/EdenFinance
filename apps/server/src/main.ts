import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { AuditInterceptor } from './audit.interceptor';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const requiredEnvs = ['SUPABASE_JWT_SECRET'];
  const missingRequired = requiredEnvs.filter((key) => !process.env[key]);
  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingRequired.join(', ')}`,
    );
  }

  const singleUserMode = process.env.SINGLE_USER_MODE !== 'false';
  if (singleUserMode && !process.env.ALLOWED_USER_EMAIL) {
    logger.warn(
      'SINGLE_USER_MODE ativo sem ALLOWED_USER_EMAIL definido; fallback interno será usado.',
    );
  }

  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 120);
  const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

  app.use((req: Request, res: Response, next: NextFunction) => {
    const ipKey = req.ip ?? 'unknown';
    const now = Date.now();
    const current = rateLimitStore.get(ipKey);

    if (!current || now > current.resetAt) {
      rateLimitStore.set(ipKey, {
        count: 1,
        resetAt: now + rateLimitWindowMs,
      });
      next();
      return;
    }

    current.count += 1;
    if (current.count > rateLimitMax) {
      res.status(429).json({
        statusCode: 429,
        message: 'Muitas requisições. Tente novamente em instantes.',
      });
      return;
    }

    next();
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new AuditInterceptor());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const defaultOrigins = ['http://localhost:8080', 'http://localhost:5173'];
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : defaultOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
