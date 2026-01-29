import { NextRequest, NextResponse } from 'next/server';
import { getCicPath } from '@/lib/cic-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceName = searchParams.get('instanceName');
    const tail = searchParams.get('tail');

    if (!instanceName) {
      return NextResponse.json(
        { error: 'Missing instanceName parameter' },
        { status: 400 }
      );
    }

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Build command
    const cicPath = await getCicPath();
    let cicCommand = `${cicPath} server logs --name ${instanceName}`;
    if (tail) {
      cicCommand += ` --tail ${tail}`;
    }

    const { stdout, stderr } = await execAsync(cicCommand);

    return NextResponse.json({
      logs: stdout || stderr,
    });
  } catch (error: any) {
    console.error('Error getting logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get logs',
        details: error.message,
        logs: error.stdout || error.stderr || ''
      },
      { status: 500 }
    );
  }
}
