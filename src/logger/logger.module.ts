import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loggerConfig } from '../config/logger.config';
import { AppLogger } from './logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env', 'development');
        return loggerConfig(env);
      },
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppLoggerModule {}
