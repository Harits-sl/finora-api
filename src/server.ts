import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { API_PREFIX } from './common/constants';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.get<number>('app.port', 3000);
  const env = configService.get<string>('app.env', 'development');
  const frontendUrl = configService.get<string>('app.frontendUrl', '*');
  const appName = configService.get<string>('app.name', 'API');

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`${appName} running in ${env} mode on port ${port}`);
  logger.log(`Base URL  → http://localhost:${port}/${API_PREFIX}`);
  logger.log(`Health    → http://localhost:${port}/${API_PREFIX}/health`);
}
