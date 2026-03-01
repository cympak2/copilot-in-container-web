import { NextResponse } from 'next/server';
import { getCicHttpBaseUrl, getCicAuthHeaders } from '@/lib/cic-config';

export interface ServerInstance {
  instanceName: string;
  containerId: string;
  containerName: string;
  port: number;
  model?: string;
  logLevel: string;
  startedAt: string;
  workspaceFolder: string;
  status: 'running' | 'stopped';
  uptime?: string;
}

export async function GET() {
  try {
    const res = await fetch(`${getCicHttpBaseUrl()}/api/servers`, {
      headers: { ...getCicAuthHeaders() },
      cache: 'no-store',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error from cic HTTP server' }));
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to reach cic HTTP server:', error);
    return NextResponse.json(
      { error: `Cannot connect to cic HTTP server: ${error.message}. Is it running? Start it with: cic http-server start` },
      { status: 503 }
    );
  }
}


