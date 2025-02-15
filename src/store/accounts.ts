import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RdpApiClient } from '../api/client';

export interface Account {
  id: string;
  name: string;
  apiKey: string;
  status: 'active' | 'pending' | 'error';
  lastChecked: string;
  error?: string;
}

interface AccountsState {
  version: number;
  accounts: Account[];
  activeAccount: Account | null;
  addAccount: (account: Pick<Account, 'name' | 'apiKey'>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  setActiveAccount: (id: string) => void;
  clearActiveAccount: () => void;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  checkAccountStatus: (id: string) => Promise<void>;
  checkAllAccountStatuses: () => Promise<void>;
}

const API_KEY_PATTERN = /^[A-Za-z0-9-_]{32,64}$/;

const initialState: Pick<AccountsState, 'version' | 'accounts' | 'activeAccount'> = {
  version: 1,
  accounts: [],
  activeAccount: null,
};

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addAccount: async (accountData) => {
        // Validate API key format
        if (!API_KEY_PATTERN.test(accountData.apiKey)) {
          throw new Error('Invalid API key format');
        }

        // Check for duplicate API key
        if (get().accounts.some(a => a.apiKey === accountData.apiKey)) {
          throw new Error('This API key is already registered');
        }

        // Validate API key by making a test request
        const isValid = await get().validateApiKey(accountData.apiKey);
        if (!isValid) {
          throw new Error('Invalid API key. Unable to connect to the server.');
        }

        const newAccount: Account = {
          id: crypto.randomUUID(),
          name: accountData.name,
          apiKey: accountData.apiKey,
          status: 'active',
          lastChecked: new Date().toISOString(),
        };

        set((state) => ({
          accounts: [...state.accounts, newAccount],
          activeAccount: state.activeAccount || newAccount,
        }));
      },

      removeAccount: async (id) => {
        const shouldDelete = window.confirm(
          'Are you sure you want to remove this account? This action cannot be undone.'
        );

        if (!shouldDelete) return;

        set((state) => {
          const accounts = state.accounts.filter((a) => a.id !== id);
          return {
            accounts,
            activeAccount:
              state.activeAccount?.id === id
                ? accounts[0] || null
                : state.activeAccount,
          };
        });
      },

      updateAccount: async (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id
              ? { ...account, ...updates }
              : account
          ),
          activeAccount:
            state.activeAccount?.id === id
              ? { ...state.activeAccount, ...updates }
              : state.activeAccount,
        }));
      },

      setActiveAccount: (id) =>
        set((state) => ({
          activeAccount: state.accounts.find((a) => a.id === id) || null,
        })),

      clearActiveAccount: () => set({ activeAccount: null }),

      validateApiKey: async (apiKey) => {
        try {
          const client = new RdpApiClient(apiKey);
          await client.listServers();
          return true;
        } catch (error) {
          return false;
        }
      },

      checkAccountStatus: async (id) => {
        const account = get().accounts.find(a => a.id === id);
        if (!account) return;

        try {
          const client = new RdpApiClient(account.apiKey);
          await client.listServers();
          
          await get().updateAccount(id, {
            status: 'active',
            lastChecked: new Date().toISOString(),
            error: undefined,
          });
        } catch (error) {
          await get().updateAccount(id, {
            status: 'error',
            lastChecked: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      checkAllAccountStatuses: async () => {
        const accounts = get().accounts;
        await Promise.all(accounts.map(account => 
          get().checkAccountStatus(account.id)
        ));
      },
    }),
    {
      name: 'accounts-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...initialState,
            ...persistedState,
            version: 1,
          };
        }
        return persistedState as AccountsState;
      },
    }
  )
);

// Set up periodic status checks
if (typeof window !== 'undefined') {
  const CHECK_INTERVAL = 30000; // 30 seconds
  setInterval(() => {
    useAccountsStore.getState().checkAllAccountStatuses();
  }, CHECK_INTERVAL);
}