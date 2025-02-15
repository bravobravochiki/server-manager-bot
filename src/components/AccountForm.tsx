import React from 'react';
import { useAccountsStore } from '../store/accounts';
import { PlusCircle, Trash2 } from 'lucide-react';

export function AccountForm() {
  const [name, setName] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const { accounts, addAccount, removeAccount, setActiveAccount, activeAccount } =
    useAccountsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && apiKey) {
      addAccount({ name, apiKey });
      setName('');
      setApiKey('');
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface shadow dark:shadow-dark-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-4">
        Manage Accounts
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Account Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm dark:shadow-dark-sm focus:border-dark-primary focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary dark:placeholder-dark-text-disabled sm:text-sm transition-colors duration-200"
            placeholder="My Hosting Account"
          />
        </div>
        
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm dark:shadow-dark-sm focus:border-dark-primary focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary dark:placeholder-dark-text-disabled sm:text-sm transition-colors duration-200"
            placeholder="Enter your API key"
          />
        </div>
        
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm dark:shadow-dark-sm text-white bg-dark-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </form>

      {accounts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Saved Accounts
          </h3>
          {accounts.map((account) => (
            <div
              key={account.apiKey}
              className={`flex items-center justify-between p-3 rounded-md border transition-colors duration-200 ${
                activeAccount?.apiKey === account.apiKey
                  ? 'bg-dark-primary bg-opacity-10 dark:bg-dark-primary/20 border-dark-primary/30'
                  : 'bg-gray-50 dark:bg-dark-elevated border-gray-200 dark:border-dark-border'
              }`}
            >
              <button
                onClick={() => setActiveAccount(account.apiKey)}
                className="flex-1 text-left"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  {account.name}
                </span>
              </button>
              <button
                onClick={() => removeAccount(account.apiKey)}
                className="ml-2 text-dark-text-disabled hover:text-dark-error transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}