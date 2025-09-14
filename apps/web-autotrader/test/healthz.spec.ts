describe('web-autotrader /api/healthz route', () => {
  it('responds with ok status JSON', async () => {
    const mod = await import('../app/api/healthz/route');
    const res = await mod.GET();
    const data = await res.json();
    expect(data).toEqual({ status: 'ok' });
  });
});
