import React from 'react';
import { Power, RefreshCw, Copy, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import type { Server } from '../../types';
import { ExpiryWarning } from '../ExpiryWarning';
import { RdpApiClient } from '../../api/client';
import { useAccountsStore } from '../../store/accounts';
import { useServersStore } from '../../store/servers';
import { useAuditStore } from '../../store/audit';
import { getOsIcon } from '../../utils/os-icons';

interface MobileServerCardProps {
  server: Server;
  nickname: string | null;
}

export function MobileServerCard({ server, nickname }: MobileServerCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { activeAccount } = useAccountsStore();
  const { refreshServers } = useServersStore();
  const { addLog } = useAuditStore();

  const handlePowerAction = async (action: 'start' | 'stop' | 'reset') => {
    if (!activeAccount) return;

    setIsLoading(true);
    try {
      const client = new RdpApiClient(activeAccount.apiKey);
      await client.powerAction(server.id, action);
      
      addLog({
        action: `SERVER_${action.toUpperCase()}`,
        details: `${action} command executed on server "${server.rdns || server.id}"`,
        accountName: activeAccount.name,
        status: 'success',
        affectedServers: [server.id],
      });

      await refreshServers();
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      
      addLog({
        action: `SERVER_${action.toUpperCase()}`,
        details: `Failed to ${action} server "${server.rdns || server.id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        accountName: activeAccount.name,
        status: 'failure',
        affectedServers: [server.id],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyIP = () => {
    navigator.clipboard.writeText(server.ip_address);
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-dark-sm border border-gray-200 dark:border-dark-border overflow-hidden transition-all duration-200">
      <div
        className="p-4 flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <img
              src={getOsIcon(server.distro)}
              alt={server.distro}
              className="w-4 h-4"
              loading="lazy"
            />
            <h3 className="font-medium text-gray-900 dark:text-dark-text-primary truncate">
              {nickname || server.rdns || server.id}
            </h3>
            <ExpiryWarning expiryDate={server.expiry_date} />
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
              {server.ip_address}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyIP();
              }}
              className="p-1 text-gray-400 dark:text-dark-text-disabled hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors duration-200"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              server.status === 'running'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400'
            }`}
          >
            {server.status}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-dark-text-disabled" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-dark-text-disabled" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-dark-border p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                Distribution
              </span>
              <p className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary">
                {server.distro}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                Expires
              </span>
              <p className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary">
                {new Date(server.expiry_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handlePowerAction('start')}
              disabled={isLoading || server.status === 'running'}
              className="flex-1 py-3 px-4 rounded-md bg-green-600 text-white disabled:opacity-50 transition-opacity duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <Power className="w-5 h-5 mx-auto" />
              )}
            </button>
            <button
              onClick={() => handlePowerAction('stop')}
              disabled={isLoading || server.status !== 'running'}
              className="flex-1 py-3 px-4 rounded-md bg-red-600 text-white disabled:opacity-50 transition-opacity duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <Power className="w-5 h-5 mx-auto" />
              )}
            </button>
            <button
              onClick={() => handlePowerAction('reset')}
              disabled={isLoading || server.status !== 'running'}
              className="flex-1 py-3 px-4 rounded-md bg-yellow-600 text-white disabled:opacity-50 transition-opacity duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mx-auto" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}