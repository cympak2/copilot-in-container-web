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

export interface TerminalSession {
  id: string;
  title: string;
  output: TerminalLine[];
  input: string;
  history: string[];
  historyIndex: number;
  serverInstance?: ServerInstance;
}

export interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}
