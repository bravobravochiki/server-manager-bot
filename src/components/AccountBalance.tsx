import React from 'react';
import { DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { RdpApiClient } from '../api/client';
import { useAccountsStore } from '../store/accounts';
import { RdpApiError } from '../api/error';

export function AccountBalance() {
  const [balance, setBalance] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { activeAccount } = useAccountsStore();
  const previousBalanceRef = React.useRef<string | null>(null);
  const retryTimeoutRef = React.useRef<number>();

  const formatBalance = (value: string) => {
    try {
      const numericValue = parseFloat(value);
      
      if (isNaN(numericValue)) {
        console.error('Invalid balance value:', value);
        return '$0.00';
      }

      const absValue = Math.abs(numericValue);
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absValue);

      return numericValue < 0 ? `-${formattedValue}` : formattedValue;
    } catch (err) {
      console.error('Error formatting balance:', err);
      return '$0.00';
    }
  };

  const fetchBalance = React.useCallback(async (retryCount = 0) => {
    if (!activeAccount?.apiKey) {
      setBalance(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const client = new RdpApiClient(activeAccount.apiKey);
      const response = await client.getBalance();
      
      previousBalanceRef.current = balance;
      setBalance(response.balance);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching balance:', err);
      
      if (err instanceof RdpApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch balance');
      }

      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        retryTimeoutRef.current = window.setTimeout(() => {
          fetchBalance(retryCount + 1);
        }, retryDelay);
      }

      setIsLoading(false);
    }
  }, [activeAccount, balance]);

  React.useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => {
      clearInterval(interval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchBalance]);

  const hasBalanceChanged = previousBalanceRef.current !== null && 
                           previousBalanceRef.current !== balance;

  if (!activeAccount) return null;

  return (
    <div 
      className={`relative flex items-center px-3 py-1.5 rounded-md bg-white dark:bg-dark-elevated border ${
        error 
          ? 'border-dark-error/30 bg-dark-error/10 dark:border-dark-error/30 dark:bg-dark-error/10' 
          : 'border-gray-200 dark:border-dark-border'
      } ${hasBalanceChanged ? 'animate-pulse' : ''} transition-colors duration-200`}
    >
      {isLoading ? (
        <div className="flex items-center text-gray-400 dark:text-dark-text-disabled">
          <DollarSign className="w-4 h-4 mr-1" />
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : error ? (
        <div 
          className="flex items-center text-dark-error" 
          title={error}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          <span className="text-sm">Error loading balance</span>
        </div>
      ) : balance ? (
        <div 
          className={`flex items-center text-gray-900 dark:text-dark-text-primary transition-opacity duration-200 ${
            hasBalanceChanged ? 'animate-balance-update' : ''
          }`}
        >
          <DollarSign className={`w-4 h-4 mr-1 ${
            parseFloat(balance) < 0 
              ? 'text-dark-error' 
              : 'text-green-500 dark:text-green-400'
          }`} />
          <span className={`font-medium ${
            parseFloat(balance) < 0 
              ? 'text-dark-error' 
              : 'text-gray-900 dark:text-dark-text-primary'
          }`}>
            {formatBalance(balance)}
          </span>
        </div>
      ) : null}
    </div>
  );
}