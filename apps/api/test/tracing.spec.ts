/* eslint-disable @typescript-eslint/no-explicit-any */
import { otelReady } from '../src/tracing';

// Jest globals (TypeScript types) ensured by @types/jest in devDependencies

describe('tracing initialization', () => {
  it('initializes in-memory exporter and attaches spans container', async () => {
    await otelReady;
    expect((global as any).__INMEMORY_SPANS__).toBeDefined();
  });
});
