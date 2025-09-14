// Inline minimal Response polyfill
// @ts-ignore
if (!global.Response) {
  class SimpleResponse {
    readonly status: number; headers: Record<string,string>; private _body: string;
    constructor(body: string, init?: { status?: number; headers?: Record<string,string> }) { this._body = body; this.status = init?.status ?? 200; this.headers = init?.headers ?? {}; }
    async json() { return JSON.parse(this._body); }
    async text() { return this._body; }
  }
  // @ts-ignore
  global.Response = SimpleResponse;
}

describe('web-autotrader /api/healthz route', () => {
  it('responds with ok status JSON', async () => {
    const mod = await import('../app/api/healthz/route');
    const res: any = await mod.GET();
    const data = await res.json();
    expect(data).toEqual({ status: 'ok' });
    expect(res.status).toBe(200);
  });
});
