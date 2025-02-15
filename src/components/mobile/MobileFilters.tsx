import React from 'react';
import { X } from 'lucide-react';
import { usePreferencesStore } from '../../store/preferences';
import type { PowerState } from '../../store/preferences';

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilters({ isOpen, onClose }: MobileFiltersProps) {
  const { filters, setFilters, resetFilters } = usePreferencesStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-dark-background z-50">
      <div className="h-16 px-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
          Filters
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-dark-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto" style={{ height: 'calc(100vh - 128px)' }}>
        {/* Power State Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
            Power State
          </h3>
          <div className="space-y-2">
            {(['running', 'stopped', 'suspended'] as PowerState[]).map((state) => (
              <label
                key={state}
                className="flex items-center space-x-3"
              >
                <input
                  type="checkbox"
                  checked={filters.powerState?.includes(state) || false}
                  onChange={(e) => {
                    const currentStates = filters.powerState || [];
                    setFilters({
                      powerState: e.target.checked
                        ? [...currentStates, state]
                        : currentStates.filter((s) => s !== state),
                    });
                  }}
                  className="w-5 h-5 text-dark-primary border-gray-300 rounded focus:ring-dark-primary"
                />
                <span className="text-gray-700 dark:text-dark-text-primary">
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
            Expiry Date Range
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-dark-text-secondary mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.expiryDateStart || ''}
                onChange={(e) =>
                  setFilters({ expiryDateStart: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-dark-text-secondary mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.expiryDateEnd || ''}
                onChange={(e) =>
                  setFilters({ expiryDateEnd: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-16 px-4 border-t border-gray-200 dark:border-dark-border flex items-center justify-between">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-gray-600 dark:text-dark-text-secondary"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-dark-primary text-white rounded-lg"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}