import React from 'react';
import { ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import type { SortField, SortDirection, PowerState } from '../store/preferences';
import { usePreferencesStore } from '../store/preferences';

interface ServerControlsProps {
  distros: string[];
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function ServerControls({ distros, onSearch, searchQuery }: ServerControlsProps) {
  const { sortField, sortDirection, filters, setSorting, setFilters, resetFilters } =
    usePreferencesStore();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSorting(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSorting(field, 'asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Sort Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          {[
            { field: 'name', label: 'Name' },
            { field: 'distro', label: 'Distribution' },
            { field: 'expiry_date', label: 'Expiry Date' },
            { field: 'status', label: 'Power State' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field as SortField)}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                sortField === field
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
              {renderSortIcon(field as SortField)}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Distribution Filter */}
          <select
            value={filters.distro || ''}
            onChange={(e) => setFilters({ distro: e.target.value || undefined })}
            className="block w-40 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Distributions</option>
            {distros.map((distro) => (
              <option key={distro} value={distro}>
                {distro}
              </option>
            ))}
          </select>

          {/* Power State Filter */}
          <div className="flex items-center space-x-2">
            {(['running', 'stopped', 'suspended'] as PowerState[]).map((state) => (
              <label
                key={state}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={filters.powerState?.includes(state) || false}
                  onChange={(e) => {
                    const currentStates = filters.powerState || [];
                    setFilters({
                      powerState: e.target.checked
                        ? [...currentStates, state]
                        : currentStates.filter((s) => s !== state),
                    });
                  }}
                />
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </label>
            ))}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.expiryDateStart || ''}
              onChange={(e) =>
                setFilters({ expiryDateStart: e.target.value || undefined })
              }
              className="block w-40 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={filters.expiryDateEnd || ''}
              onChange={(e) =>
                setFilters({ expiryDateEnd: e.target.value || undefined })
              }
              className="block w-40 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Reset Filters */}
          {Object.keys(filters).length > 0 && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Search Box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search servers by name, IP, or distribution..."
          className="block w-full rounded-md border-gray-300 pl-4 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}