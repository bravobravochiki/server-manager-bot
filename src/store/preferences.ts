import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortField = 'name' | 'distro' | 'expiry_date' | 'status';
export type SortDirection = 'asc' | 'desc';
export type PowerState = 'running' | 'stopped' | 'suspended';

interface FilterState {
  distro?: string;
  powerState?: PowerState[];
  expiryDateStart?: string;
  expiryDateEnd?: string;
}

interface PreferencesState {
  sortField: SortField;
  sortDirection: SortDirection;
  filters: FilterState;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  setSorting: (field: SortField, direction: SortDirection) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
}

const initialState: Pick<PreferencesState, 'sortField' | 'sortDirection' | 'filters' | 'darkMode' | 'sidebarCollapsed'> = {
  sortField: 'name',
  sortDirection: 'asc',
  filters: {},
  darkMode: false,
  sidebarCollapsed: false,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialState,
      setSorting: (field, direction) => set({ sortField: field, sortDirection: direction }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: {} }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'server-preferences',
    }
  )
);