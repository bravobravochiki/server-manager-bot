import React from 'react';
import { AccountManager } from './AccountManager';
import { ServerList } from './ServerList';
import { Sidebar } from './Sidebar';
import { Settings, Moon, Sun } from 'lucide-react';
import { AccountBalance } from './AccountBalance';
import { usePreferencesStore } from '../store/preferences';
import { useAccountsStore } from '../store/accounts';

export function DesktopLayout() {
  const [showAccounts, setShowAccounts] = React.useState(false);
  const { darkMode, toggleDarkMode } = usePreferencesStore();
  const { activeAccount } = useAccountsStore();

  if (!activeAccount) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <header className="bg-white dark:bg-dark-surface shadow-sm dark:shadow-dark-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
            RDPanel.sh
          </h1>
          <div className="flex items-center space-x-4">
            <AccountBalance />
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border shadow-sm dark:shadow-dark-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-elevated hover:bg-gray-50 dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-colors duration-200"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowAccounts(!showAccounts)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-dark-border shadow-sm dark:shadow-dark-sm text-sm font-medium rounded-md text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-elevated hover:bg-gray-50 dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Accounts
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {showAccounts ? (
              <div className="mb-8">
                <AccountManager />
              </div>
            ) : null}
            <ServerList />
          </div>
        </main>
      </div>
    </div>
  );
}