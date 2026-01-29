import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

interface CicConfig {
  cicPath: string;
}

let cachedConfig: CicConfig | null = null;

export async function getCicPath(): Promise<string> {
  // 1. Check environment variable first
  if (process.env.CIC_PATH) {
    return process.env.CIC_PATH;
  }

  // 2. Check config file
  if (!cachedConfig) {
    try {
      const configPath = path.join(os.homedir(), '.copilot-in-container', 'web-config.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      cachedConfig = JSON.parse(configContent);
    } catch {
      // Config file doesn't exist or is invalid, use default
      cachedConfig = { cicPath: 'cic' };
    }
  }

  return cachedConfig.cicPath || 'cic';
}

export function clearConfigCache(): void {
  cachedConfig = null;
}
