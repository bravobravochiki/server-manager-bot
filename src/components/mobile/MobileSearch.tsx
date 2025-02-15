import React from 'react';
import { Search, X } from 'lucide-react';
import { useServersStore } from '../../store/servers';
import { useNicknamesStore } from '../../store/nicknames';
import { MobileServerCard } from './MobileServerCard';

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const [query, setQuery] = React.useState('');
  const { servers } = useServersStore();
  const { getNickname } = useNicknamesStore();

  const filteredServers = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return servers.filter(server => 
      (server.rdns || '').toLowerCase().includes(searchTerm) ||
      server.ip_address.toLowerCase().includes(searchTerm) ||
      server.distro.toLowerCase().includes(searchTerm) ||
      (getNickname(server.id) || '').toLowerCase().includes(searchTerm)
    );
  }, [servers, query, getNickname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-dark-background z-50">
      <div className="h-16 px-4 border-b border-gray-200 dark:border-dark-border flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search servers..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-primary"
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-dark-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
        {query.trim() ? (
          filteredServers.length > 0 ? (
            filteredServers.map(server => (
              <MobileServerCard
                key={server.id}
                server={server}
                nickname={getNickname(server.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-dark-text-secondary">
                No servers match your search
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 dark:text-dark-text-secondary">
              Start typing to search servers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}