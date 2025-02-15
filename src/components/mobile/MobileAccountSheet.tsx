import React from 'react';
import { X, Plus, Moon, Sun } from 'lucide-react';
import { useAccountsStore } from '../../store/accounts';
import { usePreferencesStore } from '../../store/preferences';
import { AccountBalance } from '../AccountBalance';

interface MobileAccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
}

export function MobileAccountSheet({ 
  isOpen, 
  onClose,
  showCloseButton = true 
}: MobileAccountSheetProps) {
  const [apiKey, setApiKey] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const { accounts, addAccount, removeAccount, setActiveAccount, activeAccount } = useAccountsStore();
  const { darkMode, toggleDarkMode } = usePreferencesStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    try {
      await addAccount({
        name: 'My Account',
        apiKey: apiKey.trim(),
      });
      setApiKey('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-dark-background z-50">
      <div className="h-16 px-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
          Account
        </h2>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-dark-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {activeAccount && <AccountBalance />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg"
            />
          </div>

          {error && (
            <p className="text-sm text-dark-error">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 bg-dark-primary text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
        </form>

        {accounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Saved Accounts
            </h3>
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-lg border ${
                  activeAccount?.id === account.id
                    ? 'bg-dark-primary bg-opacity-10 dark:bg-dark-primary/20 border-dark-primary/30'
                    : 'bg-white dark:bg-dark-elevated border-gray-200 dark:border-dark-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveAccount(account.id)}
                    className="flex-1 text-left"
                  >
                    <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                      {account.name}
                    </span>
                  </button>
                  <button
                    onClick={() => removeAccount(account.id)}
                    className="text-gray-400 dark:text-dark-text-disabled hover:text-dark-error"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-secondary"
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}