import React from 'react';
import { useServersStore } from '../../store/servers';
import { useAccountsStore } from '../../store/accounts';
import { useNicknamesStore } from '../../store/nicknames';
import { usePreferencesStore } from '../../store/preferences';
import { sortServers, filterServers } from '../../utils/sorting';
import { MobileServerCard } from './MobileServerCard';
import { StopAllServersButton } from '../StopAllServersButton';
import { RefreshCw, AlertTriangle, Server as ServerIcon } from 'lucide-react';

export function MobileServerList() {
  const { servers, loading, error, refreshServers, startRefreshing, stopRefreshing } = useServersStore();
  const { activeAccount } = useAccountsStore();
  const { getNickname } = useNicknamesStore();
  const { sortField, sortDirection, filters } = usePreferencesStore();

  // Start auto-refresh when component mounts
  React.useEffect(() => {
    if (activeAccount) {
      startRefreshing();
    }
    return () => stopRefreshing();
  }, [activeAccount, startRefreshing, stopRefreshing]);

  const filteredServers = React.useMemo(() => {
    let result = servers;
    result = filterServers(result, filters);
    return sortServers(result, sortField, sortDirection);
  }, [servers, filters, sortField, sortDirection]);

  const runningServers = filteredServers.filter(s => s.status === 'running');

  if (!activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <ServerIcon className="w-12 h-12 text-gray-400 dark:text-dark-text-disabled mb-4" />
        <p className="text-gray-600 dark:text-dark-text-secondary text-center">
          Please add and select an account to view servers
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <RefreshCw className="w-8 h-8 text-dark-primary animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">
          Loading servers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <AlertTriangle className="w-8 h-8 text-dark-error mb-4" />
        <p className="text-dark-error text-center mb-4">{error}</p>
        <button
          onClick={() => refreshServers()}
          className="px-4 py-2 bg-dark-primary text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline-block" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20 space-y-4">
      {runningServers.length > 0 && (
        <div className="sticky top-16 z-10 -mx-4 px-4 py-2 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
          <StopAllServersButton />
        </div>
      )}

      {filteredServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <ServerIcon className="w-12 h-12 text-gray-400 dark:text-dark-text-disabled mb-4" />
          <p className="text-gray-600 dark:text-dark-text-secondary text-center">
            {Object.keys(filters).length > 0
              ? 'No servers match your filters'
              : 'No servers found'}
          </p>
        </div>
      ) : (
        filteredServers.map((server) => (
          <MobileServerCard
            key={server.id}
            server={server}
            nickname={getNickname(server.id)}
          />
        ))
      )}
    </div>
  );
}