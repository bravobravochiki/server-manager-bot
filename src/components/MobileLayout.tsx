import React from 'react';
import { Menu, X, Plus, Search, Filter, ChevronUp } from 'lucide-react';
import { useAccountsStore } from '../store/accounts';
import { usePreferencesStore } from '../store/preferences';
import { AccountBalance } from './AccountBalance';
import { ServerList } from './ServerList';
import { Sidebar } from './Sidebar';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useLayoutManager } from '../hooks/useLayoutManager';
import { MobileFilters } from './MobileFilters';
import { NewServerButton } from './NewServerButton';
import { MobileHeader } from './MobileHeader';
import { BottomSheet } from './BottomSheet';

export function MobileLayout() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { activeAccount } = useAccountsStore();
  const { darkMode } = usePreferencesStore();
  const { getSpacing, getTouchTargetSize } = useLayoutManager();

  const swipeState = useSwipeGesture(containerRef.current, {
    minDistance: 50,
    maxTime: 300
  });

  // Handle swipe to open/close menu
  React.useEffect(() => {
    if (swipeState.direction === 'right' && !menuOpen) {
      setMenuOpen(true);
    } else if (swipeState.direction === 'left' && menuOpen) {
      setMenuOpen(false);
    }
  }, [swipeState.direction, menuOpen]);

  if (!activeAccount) return null;

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-50 dark:bg-dark-background"
    >
      {/* Mobile Header */}
      <MobileHeader
        onMenuClick={() => setMenuOpen(true)}
        onSearchClick={() => setShowSearch(true)}
        onFilterClick={() => setShowFilters(true)}
      />

      {/* Search Overlay */}
      <BottomSheet
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        title="Search Servers"
      >
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, IP, or distribution..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary text-base"
              autoFocus
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-full py-2 text-sm text-gray-600 dark:text-dark-text-secondary"
            >
              Clear search
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
          onClick={() => setMenuOpen(false)}
        />
        <div 
          className="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-dark-surface shadow-lg transform transition-transform"
          style={{ padding: getSpacing(16) }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                Menu
              </h2>
              <AccountBalance />
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md"
              style={{ minHeight: getTouchTargetSize() }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <MobileFilters 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Main Content */}
      <main className="pt-[56px] pb-20">
        <div className="px-4 mb-4">
          <NewServerButton />
        </div>
        <ServerList />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border h-16 flex items-center justify-around px-4">
        <button
          onClick={() => setShowSearch(true)}
          className="p-3 text-gray-500 dark:text-dark-text-secondary hover:text-dark-primary dark:hover:text-dark-primary"
        >
          <Search className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowFilters(true)}
          className="p-3 text-gray-500 dark:text-dark-text-secondary hover:text-dark-primary dark:hover:text-dark-primary"
        >
          <Filter className="w-6 h-6" />
        </button>
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full bg-dark-primary text-white shadow-lg hover:bg-opacity-90 transition-colors duration-200 -mt-6"
          onClick={() => setShowFilters(true)}
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 text-gray-500 dark:text-dark-text-secondary hover:text-dark-primary dark:hover:text-dark-primary"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          className="p-3 text-gray-500 dark:text-dark-text-secondary hover:text-dark-primary dark:hover:text-dark-primary"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}