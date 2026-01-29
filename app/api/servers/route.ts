import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { getCicPath } from '@/lib/cic-config';

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

async function getServerInstances(): Promise<ServerInstance[]> {
  const stateDir = path.join(os.homedir(), '.copilot-in-container', 'servers');
  
  try {
    // Check if directory exists
    await fs.access(stateDir);
  } catch {
    // Directory doesn't exist, return empty array
    return [];
  }

  const files = await fs.readdir(stateDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const instances: ServerInstance[] = [];

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(stateDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Check if container is running
      const status = await checkServerStatus(data.InstanceName);

      instances.push({
        instanceName: data.InstanceName,
        containerId: data.ContainerId,
        containerName: data.ContainerName,
        port: data.Port,
        model: data.Model,
        logLevel: data.LogLevel,
        startedAt: data.StartedAt,
        workspaceFolder: data.WorkspaceFolder,
        status: status ? 'running' : 'stopped',
        uptime: status ? calculateUptime(new Date(data.StartedAt)) : undefined,
      });
    } catch (error) {
      console.error(`Error reading server state file ${file}:`, error);
    }
  }

  return instances;
}

async function checkServerStatus(instanceName: string): Promise<boolean> {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const cicPath = await getCicPath();
    const { stdout } = await execAsync(`${cicPath} server list`);
    const lines = stdout.split('\n');
    
    // Parse the output - look for the instance name and check if status is Running
    for (const line of lines) {
      // Split by multiple spaces to get columns
      const columns = line.trim().split(/\s{2,}/);
      if (columns.length >= 2 && columns[0] === instanceName) {
        // Second column is STATUS
        return columns[1]?.toLowerCase() === 'running';
      }
    }
    return false;
  } catch {
    return false;
  }
}

function calculateUptime(startedAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - startedAt.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours >= 1) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes >= 1) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export async function GET() {
  try {
    const instances = await getServerInstances();
    return NextResponse.json({ instances });
  } catch (error) {
    console.error('Error getting server instances:', error);
    return NextResponse.json(
      { error: 'Failed to get server instances' },
      { status: 500 }
    );
  }
}
