'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
  currentPath?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function TerminalInput({
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  currentPath = '~',
  autoFocus = true,
  disabled = false,
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onHistoryUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onHistoryDown();
    }
  };

  return (
    <div className="flex items-center gap-2 border-t border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-primary">{'user@terminal'}</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-accent">{currentPath}</span>
        <span className="text-muted-foreground">$</span>
      </div>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border-0 bg-transparent p-0 font-mono text-sm text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Type a command..."
        autoComplete="off"
        spellCheck="false"
        aria-label="Terminal command input"
        disabled={disabled}
      />
    </div>
  );
}
