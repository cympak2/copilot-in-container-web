import { NextRequest } from 'next/server';
import { getCicHttpBaseUrl, getCicAuthHeaders } from '@/lib/cic-config';

/**
 * POST /api/servers/execute
 *
 * Body: { instanceName: string, command: string }
 *
 * Proxies the request to `POST /api/servers/{name}/execute` on the cic HTTP
 * server and streams the Server-Sent Events response back to the browser.
 *
 * Each SSE frame from the cic server contains one of:
 *   data: {"line":"...","type":"stdout"}   – output line
 *   data: {"line":"...","type":"stderr"}   – error line
 *   data: {"eventType":"done","exitCode":0} – command finished
 */
export async function POST(request: NextRequest) {
  let body: { instanceName?: string; command?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { instanceName, command } = body;
  if (!instanceName || !command) {
    return new Response(JSON.stringify({ error: 'Missing instanceName or command' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let cicRes: Response;
  try {
    cicRes = await fetch(
      `${getCicHttpBaseUrl()}/api/servers/${encodeURIComponent(instanceName)}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCicAuthHeaders(),
        },
        body: JSON.stringify({ prompt: command }),
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Cannot connect to cic HTTP server: ${err.message}` }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!cicRes.ok) {
    const errBody = await cicRes.text();
    return new Response(errBody, {
      status: cicRes.status,
      headers: { 'Content-Type': cicRes.headers.get('Content-Type') ?? 'application/json' },
    });
  }

  // Proxy the SSE stream straight through to the browser.
  return new Response(cicRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
