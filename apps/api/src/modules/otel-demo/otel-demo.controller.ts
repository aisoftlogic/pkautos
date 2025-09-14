import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { context, trace } from '@opentelemetry/api';

@ApiTags('otel-demo')
@Controller('otel')
export class OtelDemoController {
  @Get('ping')
  ping() {
    const tracer = trace.getTracer('custom-demo');
    // Start a manual span to demonstrate custom instrumentation
    return context.with(trace.setSpan(context.active(), tracer.startSpan('custom_demo_operation')), () => {
      const activeSpan = trace.getSpan(context.active());
      activeSpan?.setAttribute('demo.attribute', 'value');
      activeSpan?.addEvent('custom_event', { info: 'sample' });
      // Simulate lightweight work
      for (let i = 0; i < 10_000; i++) {
        // noop loop to give span some duration
      }
      activeSpan?.end();
      return { ok: true };
    });
  }
}
