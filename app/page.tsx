'use client';

import { useState, useEffect } from 'react';
import { TerminalHeader } from '@/components/terminal-header';
import { TerminalTabBar } from '@/components/terminal-tab-bar';
import { TerminalSession as TerminalSessionComponent } from '@/components/terminal-session';
import { TerminalSession, TerminalLine, ServerInstance } from '@/types/terminal';

export default function Home() {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch server instances on mount
  useEffect(() => {
    async function fetchInstances() {
      try {
        const response = await fetch('/api/servers');
        const data = await response.json();

        if (data.instances && data.instances.length > 0) {
          // Create a session for each running server instance
          const newSessions: TerminalSession[] = data.instances.map((instance: ServerInstance) => ({
            id: instance.instanceName,
            title: `${instance.instanceName} (${instance.status})`,
            output: [
              {
                id: `info-${instance.instanceName}`,
                type: 'info',
                content: `Connected to server: ${instance.instanceName}`,
                timestamp: new Date(),
              },
              {
                id: `details-${instance.instanceName}`,
                type: 'output',
                content: `Port: ${instance.port} | Status: ${instance.status} | Uptime: ${instance.uptime || 'N/A'}`,
                timestamp: new Date(),
              },
              {
                id: `workspace-${instance.instanceName}`,
                type: 'output',
                content: `Workspace: ${instance.workspaceFolder}`,
                timestamp: new Date(),
              },
            ],
            input: '',
            history: [],
            historyIndex: 0,
            serverInstance: instance,
          }));

          setSessions(newSessions);
          setActiveTabId(newSessions[0].id);
        } else {
          // No instances found, show a default welcome tab
          const welcomeSession: TerminalSession = {
            id: 'welcome',
            title: 'Welcome',
            output: [
              {
                id: 'no-instances',
                type: 'info',
                content: 'No server instances found',
                timestamp: new Date(),
              },
              {
                id: 'instructions',
                type: 'output',
                content: 'Start a server instance using: cic server start --name myserver',
                timestamp: new Date(),
              },
            ],
            input: '',
            history: [],
            historyIndex: 0,
          };
          setSessions([welcomeSession]);
          setActiveTabId('welcome');
        }
      } catch (error) {
        console.error('Failed to fetch server instances:', error);
        // Show error in a default tab
        const errorSession: TerminalSession = {
          id: 'error',
          title: 'Error',
          output: [
            {
              id: 'error-msg',
              type: 'error',
              content: 'Failed to connect to server instances',
              timestamp: new Date(),
            },
          ],
          input: '',
          history: [],
          historyIndex: 0,
        };
        setSessions([errorSession]);
        setActiveTabId('error');
      } finally {
        setLoading(false);
      }
    }

    fetchInstances();
  }, []);

  const activeSession = sessions.find((s) => s.id === activeTabId);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/servers');
      const data = await response.json();

      if (data.instances && data.instances.length > 0) {
        const newSessions: TerminalSession[] = data.instances.map((instance: ServerInstance) => ({
          id: instance.instanceName,
          title: `${instance.instanceName} (${instance.status})`,
          output: [
            {
              id: `info-${instance.instanceName}`,
              type: 'info',
              content: `Connected to server: ${instance.instanceName}`,
              timestamp: new Date(),
            },
            {
              id: `details-${instance.instanceName}`,
              type: 'output',
              content: `Port: ${instance.port} | Status: ${instance.status} | Uptime: ${instance.uptime || 'N/A'}`,
              timestamp: new Date(),
            },
            {
              id: `workspace-${instance.instanceName}`,
              type: 'output',
              content: `Workspace: ${instance.workspaceFolder}`,
              timestamp: new Date(),
            },
          ],
          input: '',
          history: [],
          historyIndex: 0,
          serverInstance: instance,
        }));

        setSessions(newSessions);
        if (!newSessions.find(s => s.id === activeTabId)) {
          setActiveTabId(newSessions[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to refresh server instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTab = () => {
    // Refresh instances instead of creating a new generic tab
    handleRefresh();
  };

  const handleTabClose = (id: string) => {
    // Don't allow closing tabs - they represent server instances
    // User can refresh to update the list
    return;
  };

  const handleUpdateSession = (updatedSession: TerminalSession) => {
    setSessions(sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
  };

  return (
    <main className="flex h-screen flex-col bg-background">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-none md:my-8 md:h-[calc(100vh-4rem)] md:rounded-lg md:border md:border-border md:shadow-2xl">
        <TerminalHeader />
        <TerminalTabBar
          tabs={sessions.map((s) => ({ id: s.id, title: s.title }))}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />
        <div className="flex-1 overflow-hidden bg-background">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading server instances...</p>
            </div>
          ) : activeSession ? (
            <TerminalSessionComponent
              key={activeSession.id}
              session={activeSession}
              onUpdateSession={handleUpdateSession}
              isActive={true}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No active session</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
