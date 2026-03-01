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

/**
 * Base URL of the cic HTTP server (started with `cic http-server start`).
 * Configurable via the CIC_HTTP_URL environment variable.
 * Defaults to http://localhost:5000.
 */
export function getCicHttpBaseUrl(): string {
  return process.env.CIC_HTTP_URL?.replace(/\/$/, '') ?? 'http://localhost:5000';
}

/**
 * Optional API key for the cic HTTP server (set via `cic http-server start --api-key`).
 * Configurable via the CIC_API_KEY environment variable.
 */
export function getCicApiKey(): string | undefined {
  return process.env.CIC_API_KEY || undefined;
}

/**
 * Returns the Authorization header value when an API key is configured, or an
 * empty object when no key is set.
 */
export function getCicAuthHeaders(): Record<string, string> {
  const key = getCicApiKey();
  return key ? { Authorization: `Bearer ${key}` } : {};
}


export function clearConfigCache(): void {
  cachedConfig = null;
}
