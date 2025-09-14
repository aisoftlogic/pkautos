import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: false }), {
    bufferLogs: true
  });
  app.useLogger(app.get(Logger));

  // Metrics registry and default metrics
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  // Custom metrics (Phase 1)
  const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'] as const,
    registers: [registry]
  });
  const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    labelNames: ['method', 'route', 'status'] as const,
    registers: [registry]
  });

  // Fastify onRequest / onResponse hooks for metrics
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onRequest', async (req: any) => {
    (req as any).__metricsStart = process.hrtime.bigint();
  });
  fastify.addHook('onResponse', async (req: any, reply: any) => {
    try {
      const start = (req as any).__metricsStart as bigint | undefined;
      const route = reply.context?.config?.url || reply.request?.routerPath || req.url.split('?')[0];
      const method = req.method;
      const status = reply.statusCode;
      if (start) {
        const diffNs = Number(process.hrtime.bigint() - start);
        const diffSeconds = diffNs / 1e9;
        httpRequestDurationSeconds.labels(method, route, String(status)).observe(diffSeconds);
      }
      httpRequestsTotal.labels(method, route, String(status)).inc();
    } catch (e) {
      // ignore metric errors
    }
  });

  // Expose /metrics (plaintext)
  fastify.get('/metrics', async (_req: any, reply: any) => {
    try {
      reply.header('Content-Type', registry.contentType);
      reply.send(await registry.metrics());
    } catch (err) {
      reply.status(500).send('metrics_error');
    }
  });

  const config = new DocumentBuilder()
    .setTitle('PKAutos API')
    .setDescription('Initial OpenAPI stub')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen({ port, host: '0.0.0.0' });
  // Startup log for container health debugging
  // eslint-disable-next-line no-console
  app.get(Logger).log(`API listening on port ${port}`);
}

bootstrap();
