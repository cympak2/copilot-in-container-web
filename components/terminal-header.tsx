'use client';

import { Button } from '@/components/ui/button';
import { X, Plus, Minus, Square, Circle } from 'lucide-react';

interface TerminalHeaderProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function TerminalHeader({ onMinimize, onMaximize, onClose }: TerminalHeaderProps) {
  return (
    <div className="flex h-9 items-center justify-between border-b border-border bg-card px-3">
      <div className="flex items-center gap-2">
        <button
          className="flex h-3 w-3 items-center justify-center rounded-full bg-destructive transition-opacity hover:opacity-80"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-2 w-2 text-destructive-foreground opacity-0 transition-opacity hover:opacity-100" />
        </button>
        <button
          className="flex h-3 w-3 items-center justify-center rounded-full bg-[oklch(0.72_0.15_85)] transition-opacity hover:opacity-80"
          onClick={onMinimize}
          aria-label="Minimize"
        >
          <Minus className="h-2 w-2 text-background opacity-0 transition-opacity hover:opacity-100" />
        </button>
        <button
          className="flex h-3 w-3 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-80"
          onClick={onMaximize}
          aria-label="Maximize"
        >
          <Square className="h-2 w-2 text-primary-foreground opacity-0 transition-opacity hover:opacity-100" />
        </button>
      </div>
      <div className="flex-1 text-center">
        <span className="font-mono text-xs text-muted-foreground">Terminal</span>
      </div>
      <div className="w-[60px]" />
    </div>
  );
}
