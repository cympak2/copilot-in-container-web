'use client';

import { useState } from 'react';
import { TerminalOutput } from './terminal-output';
import { TerminalInput } from './terminal-input';
import { TerminalSession as TerminalSessionType, TerminalLine } from '@/types/terminal';

interface TerminalSessionProps {
  session: TerminalSessionType;
  onUpdateSession: (session: TerminalSessionType) => void;
  isActive: boolean;
}

export function TerminalSession({ session, onUpdateSession, isActive }: TerminalSessionProps) {
  const [currentPath, setCurrentPath] = useState('~');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCommandOnServer = async (command: string): Promise<TerminalLine[]> => {
    const newLines: TerminalLine[] = [];

    // Add command line
    newLines.push({
      id: `${Date.now()}-cmd`,
      type: 'command',
      content: command,
      timestamp: new Date(),
    });

    if (!session.serverInstance) {
      newLines.push({
        id: `${Date.now()}-err`,
        type: 'error',
        content: 'No server instance connected',
        timestamp: new Date(),
      });
      return newLines;
    }

    try {
      setIsExecuting(true);

      const response = await fetch('/api/servers/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: session.serverInstance.instanceName,
          command: command,
        }),
      });

      const data = await response.json();

      if (data.output) {
        // Split output into lines and add each as a separate terminal line
        const outputLines = data.output.split('\n').filter((line: string) => line.trim());
        outputLines.forEach((line: string, index: number) => {
          newLines.push({
            id: `${Date.now()}-out-${index}`,
            type: 'output',
            content: line,
            timestamp: new Date(),
          });
        });
      }

      if (data.error) {
        newLines.push({
          id: `${Date.now()}-err`,
          type: 'error',
          content: `Error: ${data.error}`,
          timestamp: new Date(),
        });
        if (data.details) {
          newLines.push({
            id: `${Date.now()}-err-details`,
            type: 'error',
            content: `Details: ${data.details}`,
            timestamp: new Date(),
          });
        }
      }

      // If no output and no error, show a message
      if (!data.output && !data.error) {
        newLines.push({
          id: `${Date.now()}-warn`,
          type: 'info',
          content: 'Command executed but produced no output',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      newLines.push({
        id: `${Date.now()}-err`,
        type: 'error',
        content: `Failed to execute command: ${error}`,
        timestamp: new Date(),
      });
    } finally {
      setIsExecuting(false);
    }

    return newLines;
  };

  const handleSubmit = async () => {
    if (!session.input.trim() || isExecuting) return;

    const command = session.input.trim();

    // Handle local commands
    if (command.toLowerCase() === 'clear') {
      onUpdateSession({
        ...session,
        output: [],
        input: '',
        history: [...session.history, command],
        historyIndex: session.history.length + 1,
      });
      return;
    }

    // Execute on server
    const newLines = await executeCommandOnServer(command);
    const newHistory = [...session.history, command];

    onUpdateSession({
      ...session,
      output: [...session.output, ...newLines],
      input: '',
      history: newHistory,
      historyIndex: newHistory.length,
    });
  };

  const handleHistoryUp = () => {
    if (session.historyIndex > 0) {
      const newIndex = session.historyIndex - 1;
      onUpdateSession({
        ...session,
        input: session.history[newIndex],
        historyIndex: newIndex,
      });
    }
  };

  const handleHistoryDown = () => {
    if (session.historyIndex < session.history.length - 1) {
      const newIndex = session.historyIndex + 1;
      onUpdateSession({
        ...session,
        input: session.history[newIndex],
        historyIndex: newIndex,
      });
    } else if (session.historyIndex === session.history.length - 1) {
      onUpdateSession({
        ...session,
        input: '',
        historyIndex: session.history.length,
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <TerminalOutput lines={session.output} currentPath={currentPath} />
      </div>
      {isExecuting && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          Executing command...
        </div>
      )}
      <TerminalInput
        value={session.input}
        onChange={(value) => onUpdateSession({ ...session, input: value })}
        onSubmit={handleSubmit}
        onHistoryUp={handleHistoryUp}
        onHistoryDown={handleHistoryDown}
        currentPath={currentPath}
        autoFocus={isActive}
        disabled={isExecuting}
      />
    </div>
  );
}
