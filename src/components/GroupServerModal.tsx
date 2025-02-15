import React from 'react';
import { X, Search, Loader2, AlertTriangle, Server as ServerIcon } from 'lucide-react';
import { useGroupsStore } from '../store/groups';
import type { Server } from '../types';
import { useNicknamesStore } from '../store/nicknames';

interface GroupServerModalProps {
  groupId: string;
  servers: Server[];
  onClose: () => void;
}

export function GroupServerModal({ groupId, servers, onClose }: GroupServerModalProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { getGroupById, addServersToGroup, removeServersFromGroup } = useGroupsStore();
  const { getNickname } = useNicknamesStore();
  
  const group = getGroupById(groupId);
  
  if (!group) {
    return null;
  }

  const assignedServers = servers.filter(server => 
    group.serverIds.includes(server.id)
  );

  const availableServers = servers.filter(server => 
    !group.serverIds.includes(server.id)
  );

  const filteredAvailableServers = availableServers.filter(server => {
    const searchLower = searchQuery.toLowerCase();
    return (
      server.rdns.toLowerCase().includes(searchLower) ||
      server.ip_address.toLowerCase().includes(searchLower) ||
      server.distro.toLowerCase().includes(searchLower) ||
      (getNickname(server.id) || '').toLowerCase().includes(searchLower)
    );
  });

  const handleAddServer = async (serverId: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await addServersToGroup(groupId, [serverId]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add server to group');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveServer = async (serverId: string) => {
    const confirmRemove = window.confirm(
      'Are you sure you want to remove this server from the group?'
    );
    
    if (!confirmRemove) return;

    setError(null);
    setIsLoading(true);
    try {
      await removeServersFromGroup(groupId, [serverId]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to remove server from group');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Manage Servers - {group.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {assignedServers.length} servers assigned
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search servers by name, IP, or distribution..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Assigned Servers */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Assigned Servers
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {assignedServers.length === 0 ? (
                <div className="text-center py-8">
                  <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No servers assigned</p>
                </div>
              ) : (
                assignedServers.map((server) => (
                  <div
                    key={server.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {getNickname(server.id) || server.rdns || server.id}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {server.ip_address}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                          {server.distro}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveServer(server.id)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Servers */}
          <div className="w-1/2 flex flex-col">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Available Servers
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Processing...</p>
                </div>
              ) : filteredAvailableServers.length === 0 ? (
                <div className="text-center py-8">
                  <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? 'No servers match your search'
                      : 'No servers available'}
                  </p>
                </div>
              ) : (
                filteredAvailableServers.map((server) => (
                  <div
                    key={server.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {getNickname(server.id) || server.rdns || server.id}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {server.ip_address}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                          {server.distro}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddServer(server.id)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-indigo-500 p-1 rounded-full hover:bg-gray-100"
                      >
                        <span className="sr-only">Add to group</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}