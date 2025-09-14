import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthModule } from '../src/modules/health/health.module';
import { Module } from '@nestjs/common';

@Module({ imports: [HealthModule] })
class TestRootModule {}

describe('Health endpoints (smoke)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestRootModule],
    }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/healthz GET', async () => {
    const res = await request(app.getHttpServer()).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('/readyz GET', async () => {
    const res = await request(app.getHttpServer()).get('/readyz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready' });
  });
});

// Increase default timeout for slower CI environments
jest.setTimeout(15000);
