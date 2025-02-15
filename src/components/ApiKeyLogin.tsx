import React from 'react';
import { Eye, EyeOff, Copy, HelpCircle, ArrowRight } from 'lucide-react';
import { useAccountsStore } from '../store/accounts';
import { RdpApiClient } from '../api/client';

export function ApiKeyLogin() {
  const [apiKey, setApiKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { addAccount } = useAccountsStore();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Validate the API key by making a test request
      const client = new RdpApiClient(apiKey);
      await client.listServers();

      // If successful, add the account
      addAccount({
        name: 'My Account', // User can rename later
        apiKey,
      });
    } catch (err) {
      setError('Invalid API key. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  const handleCopyClick = () => {
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      inputRef.current.setSelectionRange(0, 0);
      inputRef.current.blur();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-dark-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
              Enter Your API Key
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Connect to your RDP.sh account to manage your servers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                  }}
                  className={`block w-full px-4 py-3 rounded-lg border ${
                    error
                      ? 'border-dark-error dark:border-dark-error'
                      : 'border-gray-300 dark:border-dark-border'
                  } bg-white dark:bg-dark-elevated text-gray-900 dark:text-dark-text-primary font-mono text-sm focus:ring-2 focus:ring-dark-primary dark:focus:ring-dark-primary focus:border-transparent transition-all duration-200`}
                  placeholder="Paste your API key here"
                  spellCheck="false"
                  autoComplete="off"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyClick}
                    className="p-1.5 text-gray-400 dark:text-dark-text-disabled hover:text-gray-600 dark:hover:text-dark-text-secondary rounded-md transition-colors duration-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-gray-400 dark:text-dark-text-disabled hover:text-gray-600 dark:hover:text-dark-text-secondary rounded-md transition-colors duration-200"
                    title={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-2 text-sm text-dark-error flex items-center space-x-1">
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-2 flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-dark-text-disabled flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  You can find your API key in your RDP.sh account settings.{' '}
                  <a
                    href="https://rdp.sh/docs/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-primary hover:text-dark-secondary transition-colors duration-200"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!apiKey.trim() || loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-dark-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
              <span>{loading ? 'Connecting...' : 'Connect'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}