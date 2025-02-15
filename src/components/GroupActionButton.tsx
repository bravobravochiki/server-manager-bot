import React from 'react';
import { Power, RefreshCw } from 'lucide-react';
import type { PowerState } from '../types';
import { useAuditStore } from '../store/audit';
import { RdpApiClient } from '../api/client';

interface GroupActionButtonProps {
  groupId: string;
  groupName: string;
  action: PowerState;
  serverIds: string[];
  apiKey: string;
  onComplete?: () => void;
}

export function GroupActionButton({
  groupId,
  groupName,
  action,
  serverIds,
  apiKey,
  onComplete,
}: GroupActionButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { addLog } = useAuditStore();

  const getActionColor = () => {
    switch (action) {
      case 'start':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'stop':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'reset':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'start':
      case 'stop':
        return <Power className="w-4 h-4" />;
      case 'reset':
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getTooltipText = () => {
    switch (action) {
      case 'start':
        return 'Start all servers in this group';
      case 'stop':
        return 'Stop all servers in this group';
      case 'reset':
        return 'Reset all servers in this group';
    }
  };

  const handleClick = async () => {
    if (isLoading || serverIds.length === 0) return;

    const shouldProceed = window.confirm(
      `Are you sure you want to ${action} all servers in group "${groupName}"?`
    );

    if (!shouldProceed) return;

    setIsLoading(true);
    const client = new RdpApiClient(apiKey);
    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    try {
      // Process servers in batches of 5
      const batchSize = 5;
      for (let i = 0; i < serverIds.length; i += batchSize) {
        const batch = serverIds.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((serverId) =>
            client.powerAction(serverId, action)
          )
        );

        batchResults.forEach((result, index) => {
          const serverId = batch[index];
          if (result.status === 'fulfilled') {
            results.success.push(serverId);
          } else {
            results.failed.push(serverId);
          }
        });
      }

      // Log the action
      addLog({
        action: `GROUP_${action.toUpperCase()}_SERVERS`,
        details: `${action} command executed on group "${groupName}". Success: ${results.success.length}, Failed: ${results.failed.length}`,
        accountName: 'System',
        status: results.failed.length === 0 ? 'success' : 'failure',
        affectedServers: serverIds,
      });

      if (results.failed.length > 0) {
        throw new Error(
          `Failed to ${action} ${results.failed.length} servers`
        );
      }
    } catch (error) {
      console.error(`Error in group ${action} action:`, error);
      if (error instanceof Error) {
        window.alert(error.message);
      }
    } finally {
      setIsLoading(false);
      onComplete?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || serverIds.length === 0}
      title={getTooltipText()}
      className={`p-2 rounded-full text-white ${getActionColor()} disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
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
        getActionIcon()
      )}
    </button>
  );
}