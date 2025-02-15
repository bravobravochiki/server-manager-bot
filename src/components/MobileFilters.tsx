import React from 'react';
import { X, Search } from 'lucide-react';
import { usePreferencesStore } from '../store/preferences';
import { useLayoutManager } from '../hooks/useLayoutManager';

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilters({ isOpen, onClose }: MobileFiltersProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { filters, setFilters, resetFilters } = usePreferencesStore();
  const { getTouchTargetSize } = useLayoutManager();

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  return (
    <div
      className={`fixed inset-0 z-40 transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-xl shadow-lg max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              Filters
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md"
              style={{ minHeight: getTouchTargetSize() }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search servers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary"
              style={{ minHeight: getTouchTargetSize() }}
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Status
              </label>
              <div className="space-y-2">
                {['running', 'stopped', 'suspended'].map((status) => (
                  <label
                    key={status}
                    className="flex items-center space-x-3"
                    style={{ minHeight: getTouchTargetSize() }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.powerState?.includes(status)}
                      onChange={(e) => {
                        const currentStates = filters.powerState || [];
                        handleFilterChange(
                          'powerState',
                          e.target.checked
                            ? [...currentStates, status]
                            : currentStates.filter((s) => s !== status)
                        );
                      }}
                      className="w-4 h-4 text-dark-primary border-gray-300 rounded focus:ring-dark-primary"
                    />
                    <span className="text-sm text-gray-700 dark:text-dark-text-primary">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Expiry Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.expiryDateStart || ''}
                  onChange={(e) =>
                    handleFilterChange('expiryDateStart', e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-dark-primary focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary text-sm"
                  style={{ minHeight: getTouchTargetSize() }}
                />
                <input
                  type="date"
                  value={filters.expiryDateEnd || ''}
                  onChange={(e) =>
                    handleFilterChange('expiryDateEnd', e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-dark-primary focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary text-sm"
                  style={{ minHeight: getTouchTargetSize() }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex justify-between">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-elevated border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface"
              style={{ minHeight: getTouchTargetSize() }}
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-dark-primary rounded-md hover:bg-opacity-90"
              style={{ minHeight: getTouchTargetSize() }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}