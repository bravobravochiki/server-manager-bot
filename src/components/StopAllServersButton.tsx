import React from 'react';
import { Power, Loader2 } from 'lucide-react';
import { RdpApiClient } from '../api/client';
import { useAccountsStore } from '../store/accounts';
import { useServersStore } from '../store/servers';
import { useAuditStore } from '../store/audit';

export function StopAllServersButton() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { activeAccount } = useAccountsStore();
  const { servers, refreshServers } = useServersStore();
  const { addLog } = useAuditStore();

  const runningServers = servers.filter(s => s.status === 'running');

  if (runningServers.length === 0) return null;

  const handleStopAll = async () => {
    if (!activeAccount || isLoading) return;

    setIsLoading(true);
    try {
      const client = new RdpApiClient(activeAccount.apiKey);
      const results = await Promise.allSettled(
        runningServers.map(server => client.powerAction(server.id, 'stop'))
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failedCount = results.filter(r => r.status === 'rejected').length;

      addLog({
        action: 'STOP_ALL_SERVERS',
        details: `Stopped ${successCount} servers, ${failedCount} failed`,
        accountName: activeAccount.name,
        status: failedCount === 0 ? 'success' : 'failure',
        affectedServers: runningServers.map(s => s.id),
      });

      await refreshServers();
    } catch (error) {
      console.error('Error stopping all servers:', error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Power className="w-4 h-4 mr-2" />
        )}
        Stop All Servers ({runningServers.length})
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
              Stop All Servers?
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-6">
              This will stop {runningServers.length} running servers. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-elevated border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleStopAll}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Stopping...
                  </>
                ) : (
                  'Stop All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}