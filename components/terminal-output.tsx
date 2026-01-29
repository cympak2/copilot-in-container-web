'use client';

import { useEffect, useRef } from 'react';
import { TerminalLine } from '@/types/terminal';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalOutputProps {
  lines: TerminalLine[];
  currentPath?: string;
}

export function TerminalOutput({ lines, currentPath = '~' }: TerminalOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <ScrollArea className="h-full">
      <div className="min-h-full p-4 font-mono text-sm">
        {lines.map((line) => (
          <div key={line.id} className="mb-1">
            {line.type === 'command' && (
              <div className="flex gap-2">
                <span className="text-primary">{'user@terminal'}</span>
                <span className="text-muted-foreground">:</span>
                <span className="text-accent">{currentPath}</span>
                <span className="text-muted-foreground">$</span>
                <span className="text-foreground">{line.content}</span>
              </div>
            )}
            {line.type === 'output' && (
              <div className="text-foreground">{line.content}</div>
            )}
            {line.type === 'error' && (
              <div className="text-destructive">{line.content}</div>
            )}
            {line.type === 'info' && (
              <div className="text-primary">{line.content}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
