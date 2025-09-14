import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { AppLoggerModule } from './logger.module';
import { OtelDemoModule } from './modules/otel-demo/otel-demo.module';

@Module({
  imports: [HealthModule, AppLoggerModule, OtelDemoModule],
})
export class AppModule {}
