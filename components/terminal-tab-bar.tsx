'use client';

import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalTabBarProps {
  tabs: Array<{ id: string; title: string }>;
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

export function TerminalTabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}: TerminalTabBarProps) {
  return (
    <div className="flex h-10 items-center gap-1 border-b border-border bg-secondary px-2">
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'group flex h-8 min-w-[120px] max-w-[200px] items-center gap-2 rounded-sm px-3 transition-colors',
              activeTabId === tab.id
                ? 'bg-background text-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <button
              onClick={() => onTabClick(tab.id)}
              className="flex-1 truncate text-left text-xs font-mono"
              aria-label={`Switch to ${tab.title}`}
            >
              {tab.title}
            </button>
          </div>
        ))}
      </div>
      <Button
        onClick={onNewTab}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        aria-label="Refresh instances"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
