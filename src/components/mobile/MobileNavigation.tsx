import React from 'react';
import { Home, Search, Filter, Plus, Settings } from 'lucide-react';
import { NewServerButton } from '../NewServerButton';

interface MobileNavigationProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
}

export function MobileNavigation({
  onSearchClick,
  onFilterClick
}: MobileNavigationProps) {
  const [showNewServer, setShowNewServer] = React.useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border z-50">
        <div className="h-full flex items-center justify-around px-4">
          <button className="w-12 h-12 flex flex-col items-center justify-center text-dark-primary">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            onClick={onSearchClick}
            className="w-12 h-12 flex flex-col items-center justify-center text-gray-600 dark:text-dark-text-secondary"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </button>

          <button
            onClick={() => setShowNewServer(true)}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-dark-primary text-white shadow-lg -mt-6"
          >
            <Plus className="w-8 h-8" />
          </button>

          <button
            onClick={onFilterClick}
            className="w-12 h-12 flex flex-col items-center justify-center text-gray-600 dark:text-dark-text-secondary"
          >
            <Filter className="w-6 h-6" />
            <span className="text-xs mt-1">Filter</span>
          </button>

          <button className="w-12 h-12 flex flex-col items-center justify-center text-gray-600 dark:text-dark-text-secondary">
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      {showNewServer && (
        <NewServerButton onClose={() => setShowNewServer(false)} />
      )}
    </>
  );
}