describe('web-automart /api/healthz route', () => {
  it('responds with ok status JSON', async () => {
    // Dynamic import the route handler module
    const mod = await import('../app/api/healthz/route');
    const res = await mod.GET();
    const data = await res.json();
    expect(data).toEqual({ status: 'ok' });
  });
});
