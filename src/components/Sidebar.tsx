import React from 'react';
import { useGroupsStore, type ServerGroup } from '../store/groups';
import { useAccountsStore } from '../store/accounts';
import { usePreferencesStore } from '../store/preferences';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Folder,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  Users,
} from 'lucide-react';
import { GroupForm } from './GroupForm';
import { GroupActionButton } from './GroupActionButton';
import { GroupServerModal } from './GroupServerModal';
import { NewServerButton } from './NewServerButton';
import { RdpApiClient } from '../api/client';
import type { Server } from '../types';

export function Sidebar() {
  const [showGroupForm, setShowGroupForm] = React.useState(false);
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(null);
  const [servers, setServers] = React.useState<Server[]>([]);
  const { groups, removeGroup } = useGroupsStore();
  const { activeAccount } = useAccountsStore();
  const { sidebarCollapsed, toggleSidebar } = usePreferencesStore();

  React.useEffect(() => {
    if (activeAccount?.apiKey) {
      const client = new RdpApiClient(activeAccount.apiKey);
      client.listServers().then(setServers).catch(console.error);
    }
  }, [activeAccount]);

  const handleDeleteGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const shouldDelete = window.confirm(
      `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`
    );

    if (shouldDelete) {
      try {
        await removeGroup(groupId);
      } catch (error) {
        console.error('Error deleting group:', error);
        window.alert('Failed to delete group. Please try again.');
      }
    }
  };

  if (!activeAccount) return null;

  return (
    <div
      className={`h-full bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
        <h2
          className={`font-semibold text-gray-800 dark:text-dark-text-primary transition-all duration-300 ${
            sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
          }`}
        >
          RDPanel.sh
        </h2>
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-md transition-colors duration-200"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className={`p-4 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
        <NewServerButton />
        <button
          onClick={() => setShowGroupForm(true)}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-dark-primary hover:bg-opacity-90 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-primary dark:focus:ring-offset-dark-background transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </button>
      </div>

      <div className="overflow-y-auto">
        {groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            isCollapsed={sidebarCollapsed}
            onEdit={() => setEditingGroupId(group.id)}
            onDelete={() => handleDeleteGroup(group.id)}
            onManageServers={() => setSelectedGroupId(group.id)}
            apiKey={activeAccount.apiKey}
          />
        ))}
      </div>

      {(showGroupForm || editingGroupId) && (
        <GroupForm
          groupId={editingGroupId || undefined}
          onClose={() => {
            setShowGroupForm(false);
            setEditingGroupId(null);
          }}
        />
      )}

      {selectedGroupId && (
        <GroupServerModal
          groupId={selectedGroupId}
          servers={servers}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </div>
  );
}

interface GroupItemProps {
  group: ServerGroup;
  isCollapsed: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onManageServers: () => void;
  apiKey: string;
}

function GroupItem({
  group,
  isCollapsed,
  onEdit,
  onDelete,
  onManageServers,
  apiKey,
}: GroupItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-elevated relative group transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => !isCollapsed && setIsExpanded(!isExpanded)}
        className="w-full flex items-center text-left"
      >
        <div
          className="w-2 h-2 rounded-full mr-3"
          style={{ backgroundColor: group.color }}
        />
        <Folder className="w-4 h-4 text-gray-400 dark:text-dark-text-disabled mr-2" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-dark-text-primary">
              {group.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary mr-2">
              {group.serverIds.length}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-dark-text-disabled" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-dark-text-disabled" />
            )}
          </>
        )}
      </button>

      {!isCollapsed && isHovered && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-white dark:bg-dark-elevated shadow-sm dark:shadow-dark-sm rounded-md border border-gray-200 dark:border-dark-border px-1">
          <button
            onClick={onManageServers}
            className="p-2 text-gray-400 dark:text-dark-text-disabled hover:text-dark-primary dark:hover:text-dark-primary transition-colors duration-200"
            title="Manage servers"
          >
            <Users className="w-4 h-4" />
          </button>
          <GroupActionButton
            groupId={group.id}
            groupName={group.name}
            action="start"
            serverIds={group.serverIds}
            apiKey={apiKey}
          />
          <GroupActionButton
            groupId={group.id}
            groupName={group.name}
            action="stop"
            serverIds={group.serverIds}
            apiKey={apiKey}
          />
          <GroupActionButton
            groupId={group.id}
            groupName={group.name}
            action="reset"
            serverIds={group.serverIds}
            apiKey={apiKey}
          />
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 dark:text-dark-text-disabled hover:text-gray-500 dark:hover:text-dark-text-primary transition-colors duration-200"
            title="Edit group"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 dark:text-dark-text-disabled hover:text-dark-error transition-colors duration-200"
            title="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {isExpanded && !isCollapsed && (
        <div className="ml-7 mt-2 space-y-2">
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
            {group.description}
          </p>
          {group.serverIds.length > 0 ? (
            <div className="text-xs text-gray-400 dark:text-dark-text-disabled">
              {group.serverIds.length} server
              {group.serverIds.length === 1 ? '' : 's'}
            </div>
          ) : (
            <div className="text-xs text-gray-400 dark:text-dark-text-disabled italic">
              No servers assigned
            </div>
          )}
        </div>
      )}
    </div>
  );
}