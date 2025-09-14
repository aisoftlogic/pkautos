import { Module } from '@nestjs/common';
import { OtelDemoController } from './otel-demo.controller';

@Module({
  controllers: [OtelDemoController],
})
export class OtelDemoModule {}
