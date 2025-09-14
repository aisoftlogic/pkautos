import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        redact: ['req.headers.authorization'],
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        quietReqLogger: true,
      }
    })
  ],
  exports: [LoggerModule]
})
export class AppLoggerModule {}
