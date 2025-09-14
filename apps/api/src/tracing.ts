// OpenTelemetry initialization (loaded before Nest bootstrap)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const serviceName = process.env.OTEL_SERVICE_NAME || '@pkautos/api';
const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318/v1/traces';

// Allow tests to capture spans without a collector by setting OTEL_TEST_EXPORTER=inmemory
const useInMemory = process.env.OTEL_TEST_EXPORTER === 'inmemory';
const inMemoryExporter = useInMemory ? new InMemorySpanExporter() : undefined;
const otlpExporter = useInMemory ? undefined : new OTLPTraceExporter({ url: endpoint });

const baseResource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '0.0.0'
});

const sdkConfig: any = {
  resource: baseResource,
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-http': { enabled: true },
    '@opentelemetry/instrumentation-fastify': { enabled: true },
    '@opentelemetry/instrumentation-nestjs-core': { enabled: true }
  })]
};

if (useInMemory && inMemoryExporter) {
  sdkConfig.spanProcessor = new SimpleSpanProcessor(inMemoryExporter);
} else if (otlpExporter) {
  sdkConfig.traceExporter = otlpExporter;
}

const sdk = new NodeSDK(sdkConfig);

export const otelReady = Promise.resolve(sdk.start())
  .then(() => {
    if (useInMemory && inMemoryExporter) {
      // @ts-ignore attach for tests
      global.__INMEMORY_SPANS__ = inMemoryExporter;
      // eslint-disable-next-line no-console
      console.log('[otel] in-memory span exporter enabled');
    }
    // eslint-disable-next-line no-console
    console.log('[otel] tracing initialized');
  })
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('[otel] initialization error', err);
  });

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('[otel] shutdown complete'))
    .catch(err => console.error('[otel] shutdown error', err))
    .finally(() => process.exit(0));
});
