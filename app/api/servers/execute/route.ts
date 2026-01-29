import { NextRequest, NextResponse } from 'next/server';
import { getCicPath } from '@/lib/cic-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceName, command } = body;

    if (!instanceName || !command) {
      return NextResponse.json(
        { error: 'Missing instanceName or command' },
        { status: 400 }
      );
    }

    // Execute command using cic server connect with --no-tty flag
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Use cic server connect with --no-tty for non-interactive use
    const cicPath = await getCicPath();
    const escapedCommand = command.replace(/"/g, '\\"');
    const cicCommand = `${cicPath} server connect --name ${instanceName} --no-tty "${escapedCommand}"`;
    
    console.log('Executing command:', cicCommand);

    const { stdout, stderr } = await execAsync(cicCommand, {
      timeout: 60000, // 60 second timeout for AI responses
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large outputs
    });

    console.log('Command output:', { stdout, stderr });

    return NextResponse.json({
      output: stdout || stderr,
      error: stderr && !stdout ? stderr : null,
    });
  } catch (error: any) {
    console.error('Error executing command:', error);
    console.error('Error details:', {
      message: error.message,
      stdout: error.stdout,
      stderr: error.stderr,
      code: error.code,
    });

    return NextResponse.json(
      { 
        error: 'Failed to execute command',
        details: error.message,
        output: error.stdout || error.stderr || '',
        errorCode: error.code,
      },
      { status: 500 }
    );
  }
}
