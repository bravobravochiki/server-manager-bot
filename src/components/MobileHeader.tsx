import React from 'react';
import { Menu, Search, Filter } from 'lucide-react';
import { useLayoutManager } from '../hooks/useLayoutManager';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onFilterClick: () => void;
}

export function MobileHeader({ onMenuClick, onSearchClick, onFilterClick }: MobileHeaderProps) {
  const { getTouchTargetSize } = useLayoutManager();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border h-14">
      <div className="h-full flex items-center justify-between px-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md"
          style={{ minHeight: getTouchTargetSize() }}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h1 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
          RDPanel.sh
        </h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSearchClick}
            className="p-2 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md"
            style={{ minHeight: getTouchTargetSize() }}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={onFilterClick}
            className="p-2 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md"
            style={{ minHeight: getTouchTargetSize() }}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}