import 'reflect-metadata';
process.env.OTEL_TEST_EXPORTER = 'inmemory';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Module } from '@nestjs/common';
import { OtelDemoModule } from '../src/modules/otel-demo/otel-demo.module';
import { otelReady } from '../src/tracing';

@Module({ imports: [OtelDemoModule] })
class TestRootModule {}

describe('OTel Demo endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestRootModule],
    }).compile();
  app = moduleRef.createNestApplication();
  await otelReady; // ensure tracing initialized
  await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/otel/ping GET emits span', async () => {
    const res = await request(app.getHttpServer()).get('/otel/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    // @ts-ignore test helper global set in tracing.ts when in-memory exporter active
    const exporter = global.__INMEMORY_SPANS__;
    expect(exporter).toBeDefined();
    const finishedSpans = exporter.getFinishedSpans();
    const custom = finishedSpans.find((s: any) => s.name === 'custom_demo_operation');
    expect(custom).toBeDefined();
    expect(custom.attributes['demo.attribute']).toBe('value');
  });
});

jest.setTimeout(15000);
