import { create } from 'zustand';
import { RdpApiClient } from '../api/client';
import { useAccountsStore } from './accounts';
import { useAuditStore } from './audit';
import type { Server } from '../types';

interface ServersState {
  servers: Server[];
  loading: boolean;
  error: string | null;
  lastRefreshed: string | null;
  refreshInterval: number;
  isRefreshing: boolean;
  failedAttempts: number;
  lastKnownGoodState: Server[] | null;
  setServers: (servers: Server[]) => void;
  setError: (error: string | null) => void;
  setRefreshInterval: (interval: number) => void;
  startRefreshing: () => void;
  stopRefreshing: () => void;
  refreshServers: (silent?: boolean) => Promise<void>;
}

export const useServersStore = create<ServersState>((set, get) => ({
  servers: [],
  loading: false,
  error: null,
  lastRefreshed: null,
  refreshInterval: 60000, // 60 seconds
  isRefreshing: false,
  failedAttempts: 0,
  lastKnownGoodState: null,
  
  setServers: (servers) => set({ servers }),
  setError: (error) => set({ error }),
  setRefreshInterval: (interval) => set({ refreshInterval: interval }),

  startRefreshing: () => {
    const state = get();
    if (state.isRefreshing) return;

    set({ isRefreshing: true });
    
    // Initial refresh (non-silent)
    state.refreshServers(false);

    // Set up interval for silent refreshes
    const intervalId = setInterval(() => {
      state.refreshServers(true);
    }, state.refreshInterval);

    // Store interval ID in window object for cleanup
    window.__serverRefreshInterval = intervalId;
  },

  stopRefreshing: () => {
    if (window.__serverRefreshInterval) {
      clearInterval(window.__serverRefreshInterval);
      window.__serverRefreshInterval = undefined;
    }
    set({ isRefreshing: false });
  },

  refreshServers: async (silent = false) => {
    const state = get();
    const activeAccount = useAccountsStore.getState().activeAccount;
    const { addLog } = useAuditStore.getState();

    if (!activeAccount) {
      set({ error: 'No active account' });
      return;
    }

    // Only show loading state if not silent and we've had multiple failures
    if (!silent && state.failedAttempts >= 15) {
      set({ loading: true });
    }

    try {
      const client = new RdpApiClient(activeAccount.apiKey);
      const servers = await client.listServers();
      
      // Store last known good state
      set({
        lastKnownGoodState: servers,
        servers,
        lastRefreshed: new Date().toISOString(),
        loading: false,
        error: null,
        failedAttempts: 0, // Reset failed attempts on success
      });

      // Only log successful refreshes if not silent
      if (!silent) {
        addLog({
          action: 'SERVERS_REFRESH',
          details: `Successfully refreshed ${servers.length} servers`,
          accountName: activeAccount.name,
          status: 'success',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh servers';
      
      // Increment failed attempts
      const newFailedAttempts = state.failedAttempts + 1;
      
      set((state) => ({
        // Only show error if we've had multiple failures and it's not a silent refresh
        error: !silent && newFailedAttempts >= 15 ? errorMessage : state.error,
        loading: false,
        failedAttempts: newFailedAttempts,
        // Restore last known good state if available
        servers: state.lastKnownGoodState || state.servers,
      }));

      // Only log errors if not silent and we've had multiple failures
      if (!silent && newFailedAttempts >= 15) {
        addLog({
          action: 'SERVERS_REFRESH',
          details: `Failed to refresh servers: ${errorMessage}`,
          accountName: activeAccount.name,
          status: 'failure',
        });
      }

      console.error('Error refreshing servers:', error);

      // Schedule an immediate retry with exponential backoff
      const backoffDelay = Math.min(1000 * Math.pow(2, newFailedAttempts), 30000);
      setTimeout(() => {
        get().refreshServers(true);
      }, backoffDelay);
    }
  },
}));

// Add type definition for the refresh interval
declare global {
  interface Window {
    __serverRefreshInterval?: number;
  }
}