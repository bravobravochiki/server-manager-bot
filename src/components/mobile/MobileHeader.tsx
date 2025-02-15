import React from 'react';
import { User, Search, Filter } from 'lucide-react';
import { AccountBalance } from '../AccountBalance';

interface MobileHeaderProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
  onAccountClick: () => void;
}

export function MobileHeader({
  onSearchClick,
  onFilterClick,
  onAccountClick
}: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border z-50 px-4">
      <div className="h-full flex items-center justify-between">
        <button
          onClick={onAccountClick}
          className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-dark-text-secondary"
        >
          <User className="w-5 h-5" />
        </button>

        <AccountBalance />

        <div className="flex items-center space-x-2">
          <button
            onClick={onSearchClick}
            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-dark-text-secondary"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={onFilterClick}
            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-dark-text-secondary"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}