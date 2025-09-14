import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
// @ts-ignore
if (!global.TextDecoder) global.TextDecoder = TextDecoder as any;

import { fetch, Request, Headers, FormData, File } from 'undici';
// @ts-ignore
if (!global.fetch) global.fetch = fetch as any;
// @ts-ignore
if (!global.Request) global.Request = Request as any;
// @ts-ignore
if (!global.Headers) global.Headers = Headers as any;
// @ts-ignore
if (!global.FormData) global.FormData = FormData as any;
// @ts-ignore
if (!global.File) global.File = File as any;

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
