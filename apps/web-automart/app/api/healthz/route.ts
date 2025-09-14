// Simple health route without NextResponse dependency for easier testing
export const runtime = 'nodejs';

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
