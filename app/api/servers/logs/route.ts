import { NextRequest, NextResponse } from 'next/server';
import { getCicHttpBaseUrl, getCicAuthHeaders } from '@/lib/cic-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instanceName = searchParams.get('instanceName');
  const tail = searchParams.get('tail');

  if (!instanceName) {
    return NextResponse.json(
      { error: 'Missing instanceName parameter' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(
      `${getCicHttpBaseUrl()}/api/servers/${encodeURIComponent(instanceName)}/logs`
    );
    if (tail) url.searchParams.set('tail', tail);

    const res = await fetch(url.toString(), {
      headers: { ...getCicAuthHeaders() },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error from cic HTTP server' }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Cannot connect to cic HTTP server: ${error.message}` },
      { status: 503 }
    );
  }
}
