import '@testing-library/jest-dom';

// Minimal Response polyfill sufficient for route unit tests (avoid full fetch stack)
class SimpleResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  private readonly _body: string;
  constructor(body: string, init?: { status?: number; headers?: Record<string,string> }) {
    this._body = body;
    this.status = init?.status ?? 200;
    this.headers = init?.headers ?? {};
  }
  async json() { return JSON.parse(this._body); }
  async text() { return this._body; }
}
// @ts-ignore
if (!global.Response) global.Response = SimpleResponse as any;
