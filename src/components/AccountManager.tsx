import React from 'react';
import { useAccountsStore, type Account } from '../store/accounts';
import { 
  Plus,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AccountManager() {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);
  const { accounts, addAccount, removeAccount, updateAccount, setActiveAccount, activeAccount } = useAccountsStore();

  return (
    <div className="bg-white dark:bg-dark-surface shadow dark:shadow-dark-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
          Account Management
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-dark-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Account
        </button>
      </div>

      {showAddForm && (
        <AccountForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isActive={account.id === activeAccount?.id}
            onEdit={() => setEditingAccount(account)}
            onDelete={() => removeAccount(account.id)}
            onSelect={() => setActiveAccount(account.id)}
          />
        ))}
      </div>

      {editingAccount && (
        <AccountForm
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSuccess={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
}

interface AccountFormProps {
  account?: Account;
  onClose: () => void;
  onSuccess: () => void;
}

function AccountForm({ account, onClose, onSuccess }: AccountFormProps) {
  const [name, setName] = React.useState(account?.name || '');
  const [apiKey, setApiKey] = React.useState(account?.apiKey || '');
  const [showKey, setShowKey] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { addAccount, updateAccount } = useAccountsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiKey.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (account) {
        await updateAccount(account.id, { name, apiKey });
      } else {
        await addAccount({ name, apiKey });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg dark:shadow-dark-lg w-[480px] max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
            {account ? 'Edit Account' : 'Add New Account'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-text-disabled hover:text-gray-500 dark:hover:text-dark-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-dark-error/10 text-dark-error rounded-md text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm dark:shadow-dark-sm focus:border-dark-primary focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary dark:placeholder-dark-text-disabled text-sm transition-colors duration-200"
              placeholder="e.g., Production Account"
              maxLength={32}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm dark:shadow-dark-sm focus:border-dark-primary focus:ring-dark-primary dark:bg-dark-elevated dark:text-dark-text-primary dark:placeholder-dark-text-disabled text-sm font-mono transition-colors duration-200"
                placeholder="Enter your API key"
                maxLength={64}
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-disabled hover:text-gray-600 dark:hover:text-dark-text-secondary"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="mt-1 flex items-start space-x-1">
              <HelpCircle className="w-4 h-4 text-gray-400 dark:text-dark-text-disabled flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                API keys should be 32-64 characters long and contain only letters, numbers, hyphens, and underscores.
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-elevated border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-dark-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

function AccountCard({ account, isActive, onEdit, onDelete, onSelect }: AccountCardProps) {
  const getStatusColor = () => {
    switch (account.status) {
      case 'active':
        return 'text-green-500 dark:text-green-400';
      case 'pending':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'error':
        return 'text-dark-error';
    }
  };

  const getStatusIcon = () => {
    switch (account.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`relative group rounded-lg border transition-all duration-200 ${
        isActive
          ? 'bg-dark-primary bg-opacity-10 dark:bg-dark-primary/20 border-dark-primary/30'
          : 'bg-gray-50 dark:bg-dark-elevated border-gray-200 dark:border-dark-border hover:border-dark-primary/30 dark:hover:border-dark-primary/30'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onSelect}
            className="flex items-center space-x-3 flex-1 text-left"
          >
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {account.name}
              </span>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
              Last checked: {formatDistanceToNow(new Date(account.lastChecked))} ago
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 dark:text-dark-text-disabled hover:text-gray-600 dark:hover:text-dark-text-secondary rounded-md"
                title="Edit account"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 dark:text-dark-text-disabled hover:text-dark-error rounded-md"
                title="Delete account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {account.error && (
          <div className="mt-2 text-sm text-dark-error">
            {account.error}
          </div>
        )}
      </div>
    </div>
  );
}