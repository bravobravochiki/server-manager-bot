import React from 'react';
import { useServersStore } from '../store/servers';
import { useAccountsStore } from '../store/accounts';
import { useNicknamesStore } from '../store/nicknames';
import { usePreferencesStore } from '../store/preferences';
import { sortServers, filterServers } from '../utils/sorting';
import { ServerControls } from './ServerControls';
import { StopAllServersModal } from './StopAllServersModal';
import { BatchCommandsModal } from './BatchCommandsModal';
import { ExpiryWarning } from './ExpiryWarning';
import { 
  Power, 
  RefreshCw, 
  AlertTriangle, 
  Grid, 
  List, 
  Copy, 
  Edit2,
  Check,
  Server as ServerIcon,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RdpApiClient } from '../api/client';
import type { PowerState } from '../types';

export function ServerList() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedServers, setSelectedServers] = React.useState<string[]>([]);
  const [showStopAllModal, setShowStopAllModal] = React.useState(false);
  const [showBatchCommands, setShowBatchCommands] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [editingNickname, setEditingNickname] = React.useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = React.useState('');

  const { activeAccount } = useAccountsStore();
  const { sortField, sortDirection, filters } = usePreferencesStore();
  const { getNickname, setNickname } = useNicknamesStore();
  const { 
    servers,
    loading,
    error,
    lastRefreshed,
    refreshServers,
    startRefreshing,
    stopRefreshing
  } = useServersStore();

  // Start refreshing when component mounts
  React.useEffect(() => {
    if (activeAccount) {
      startRefreshing();
    }
    return () => stopRefreshing();
  }, [activeAccount, startRefreshing, stopRefreshing]);

  const handlePowerAction = async (serverId: string, action: PowerState) => {
    if (!activeAccount) return;
    
    try {
      const client = new RdpApiClient(activeAccount.apiKey);
      await client.powerAction(serverId, action);
      await refreshServers();
    } catch (err) {
      console.error(`Error performing ${action} action:`, err);
      if (err instanceof Error) {
        useServersStore.getState().setError(err.message);
      }
    }
  };

  const handleStopAllServers = async () => {
    if (!activeAccount) return;

    const runningServers = servers.filter(s => s.status === 'running');
    const client = new RdpApiClient(activeAccount.apiKey);
    
    const results = await Promise.allSettled(
      runningServers.map(server => client.powerAction(server.id, 'stop'))
    );

    const failedStops = results.filter(r => r.status === 'rejected').length;

    if (failedStops > 0) {
      useServersStore.getState().setError(`Failed to stop ${failedStops} servers. Please check the status of each server.`);
    }

    await refreshServers();
  };

  const handleBatchAction = async (action: PowerState) => {
    if (!activeAccount || selectedServers.length === 0) return;

    const client = new RdpApiClient(activeAccount.apiKey);
    const results = await Promise.allSettled(
      selectedServers.map((serverId) => client.powerAction(serverId, action))
    );

    const failureCount = results.filter(r => r.status === 'rejected').length;

    if (failureCount > 0) {
      useServersStore.getState().setError(`Failed to ${action} ${failureCount} servers. Please check individual server status.`);
    }

    await refreshServers();
  };

  const handleNicknameSubmit = async (serverId: string) => {
    try {
      await setNickname(serverId, nicknameInput.trim());
      setEditingNickname(null);
      setNicknameInput('');
    } catch (err) {
      if (err instanceof Error) {
        useServersStore.getState().setError(err.message);
      }
    }
  };

  const getOsIcon = (distro: string) => {
    const lowerDistro = distro.toLowerCase();
    if (lowerDistro.includes('windows')) return OS_ICONS.windows;
    if (lowerDistro.includes('ubuntu')) return OS_ICONS.ubuntu;
    if (lowerDistro.includes('debian')) return OS_ICONS.debian;
    if (lowerDistro.includes('centos')) return OS_ICONS.centos;
    return OS_ICONS.linux;
  };

  // Filter and sort servers
  const filteredServers = React.useMemo(() => {
    let result = servers;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(server => 
        (server.rdns || '').toLowerCase().includes(query) ||
        server.ip_address.toLowerCase().includes(query) ||
        server.distro.toLowerCase().includes(query) ||
        (getNickname(server.id) || '').toLowerCase().includes(query)
      );
    }

    // Apply preference filters
    result = filterServers(result, filters);

    // Apply sorting
    return sortServers(result, sortField, sortDirection);
  }, [servers, searchQuery, filters, sortField, sortDirection, getNickname]);

  const uniqueDistros = React.useMemo(() => 
    Array.from(new Set(servers.map(s => s.distro))).sort(),
    [servers]
  );

  if (!activeAccount) {
    return (
      <div className="text-center py-12">
        <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Please add and select an account to view servers.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
        <p className="mt-2 text-gray-500">Loading servers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500">{error}</p>
        <button
          onClick={refreshServers}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
            Servers for {activeAccount.name}
          </h2>
          <span className="px-2.5 py-0.5 text-sm font-medium bg-indigo-100 dark:bg-dark-primary/20 text-indigo-800 dark:text-dark-text-primary rounded-full">
            {servers.length} Servers
          </span>
          {lastRefreshed && (
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Last updated {formatDistanceToNow(new Date(lastRefreshed))} ago
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 mr-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Batch Actions */}
          {selectedServers.length > 0 && (
            <button
              onClick={() => setShowBatchCommands(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Batch Commands ({selectedServers.length})
            </button>
          )}

          {/* Stop All Servers */}
          {servers.some(s => s.status === 'running') && (
            <button
              onClick={() => setShowStopAllModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Power className="w-4 h-4 mr-2" />
              Stop All Servers
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={refreshServers}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Server Controls */}
      <ServerControls
        distros={uniqueDistros}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Server List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServers.map((server) => (
            <div
              key={server.id}
              className="group bg-white shadow-sm hover:shadow-md rounded-lg border border-gray-200 transition-all duration-200"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedServers.includes(server.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServers([...selectedServers, server.id]);
                        } else {
                          setSelectedServers(selectedServers.filter(id => id !== server.id));
                        }
                      }}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <img
                          src={getOsIcon(server.distro)}
                          alt={server.distro}
                          className="w-5 h-5"
                        />
                        {editingNickname === server.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={nicknameInput}
                              onChange={(e) => setNicknameInput(e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Enter nickname..."
                            />
                            <button
                              onClick={() => handleNicknameSubmit(server.id)}
                              className="inline-flex items-center p-1 border border-transparent rounded-full text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {getNickname(server.id) || server.rdns || server.id}
                            </h3>
                            <button
                              onClick={() => {
                                setEditingNickname(server.id);
                                setNicknameInput(getNickname(server.id) || '');
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-500"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500">{server.ip_address}</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(server.ip_address)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-500"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <ExpiryWarning expiryDate={server.expiry_date} />
                      </div>
                      <span
                        className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          server.status === 'running'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {server.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-500">Distro:</span>
                    <span className="ml-1 text-gray-900">{server.distro}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Expires:</span>
                    <span className="ml-1 text-gray-900">
                      {new Date(server.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePowerAction(server.id, 'start')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={server.status === 'running'}
                  >
                    <Power className="w-4 h-4 mr-1" />
                    Start
                  </button>
                  <button
                    onClick={() => handlePowerAction(server.id, 'stop')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={server.status !== 'running'}
                  >
                    <Power className="w-4 h-4 mr-1" />
                    Stop
                  </button>
                  <button
                    onClick={() => handlePowerAction(server.id, 'reset')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={server.status !== 'running'}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedServers.length === filteredServers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServers(filteredServers.map(s => s.id));
                      } else {
                        setSelectedServers([]);
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distribution
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServers.map((server) => (
                <tr key={server.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedServers.includes(server.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServers([...selectedServers, server.id]);
                        } else {
                          setSelectedServers(selectedServers.filter(id => id !== server.id));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getOsIcon(server.distro)}
                        alt={server.distro}
                        className="w-5 h-5"
                      />
                      {editingNickname === server.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter nickname..."
                          />
                          <button
                            onClick={() => handleNicknameSubmit(server.id)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {getNickname(server.id) || server.rdns || server.id}
                          </span>
                          <button
                            onClick={() => {
                              setEditingNickname(server.id);
                              setNicknameInput(getNickname(server.id) || '');
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{server.ip_address}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(server.ip_address)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <ExpiryWarning expiryDate={server.expiry_date} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{server.distro}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        server.status === 'running'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {server.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(server.expiry_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handlePowerAction(server.id, 'start')}
                        disabled={server.status === 'running'}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePowerAction(server.id, 'stop')}
                        disabled={server.status !== 'running'}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePowerAction(server.id, 'reset')}
                        disabled={server.status !== 'running'}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredServers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery
              ? 'No servers match your search criteria'
              : 'No servers found for this account'}
          </p>
        </div>
      )}

      {showStopAllModal && (
        <StopAllServersModal
          onClose={() => setShowStopAllModal(false)}
          onConfirm={handleStopAllServers}
          serverCount={servers.filter(s => s.status === 'running').length}
        />
      )}

      {showBatchCommands && (
        <BatchCommandsModal
          onClose={() => setShowBatchCommands(false)}
          onExecute={handleBatchAction}
          selectedCount={selectedServers.length}
        />
      )}
    </div>
  );
}

const OS_ICONS = {
  windows: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg',
  linux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
  ubuntu: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg',
  debian: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/debian/debian-original.svg',
  centos: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/centos/centos-original.svg',
};