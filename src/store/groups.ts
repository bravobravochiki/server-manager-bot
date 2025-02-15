import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Server } from '../types';
import { useAuditStore } from './audit';

export interface ServerGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  serverIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface GroupValidationError extends Error {
  code: 'DUPLICATE_NAME' | 'SERVER_ALREADY_GROUPED' | 'INVALID_GROUP';
}

interface GroupsState {
  groups: ServerGroup[];
  addGroup: (group: Omit<ServerGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ServerGroup>;
  removeGroup: (id: string) => Promise<void>;
  updateGroup: (id: string, group: Partial<Omit<ServerGroup, 'id'>>) => Promise<ServerGroup>;
  addServersToGroup: (groupId: string, serverIds: string[]) => Promise<void>;
  removeServersFromGroup: (groupId: string, serverIds: string[]) => Promise<void>;
  getGroupById: (id: string) => ServerGroup | undefined;
  getGroupByName: (name: string) => ServerGroup | undefined;
  getGroupsForServer: (serverId: string) => ServerGroup[];
  validateGroupName: (name: string, excludeGroupId?: string) => boolean;
}

const createGroupValidationError = (
  message: string,
  code: GroupValidationError['code']
): GroupValidationError => {
  const error = new Error(message) as GroupValidationError;
  error.code = code;
  return error;
};

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set, get) => ({
      groups: [],
      
      addGroup: async (group) => {
        // Validate group name
        if (get().getGroupByName(group.name)) {
          throw createGroupValidationError(
            `Group name "${group.name}" already exists`,
            'DUPLICATE_NAME'
          );
        }

        const newGroup: ServerGroup = {
          ...group,
          id: crypto.randomUUID(),
          serverIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ groups: [...state.groups, newGroup] }));

        // Log the action
        useAuditStore.getState().addLog({
          action: 'GROUP_CREATE',
          details: `Created group "${group.name}"`,
          accountName: 'System',
          status: 'success',
        });

        return newGroup;
      },

      removeGroup: async (id) => {
        const group = get().getGroupById(id);
        if (!group) {
          throw createGroupValidationError(
            'Group not found',
            'INVALID_GROUP'
          );
        }

        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        }));

        useAuditStore.getState().addLog({
          action: 'GROUP_DELETE',
          details: `Deleted group "${group.name}"`,
          accountName: 'System',
          status: 'success',
        });
      },

      updateGroup: async (id, updates) => {
        const group = get().getGroupById(id);
        if (!group) {
          throw createGroupValidationError(
            'Group not found',
            'INVALID_GROUP'
          );
        }

        // Validate name if it's being updated
        if (updates.name && updates.name !== group.name) {
          if (get().getGroupByName(updates.name)) {
            throw createGroupValidationError(
              `Group name "${updates.name}" already exists`,
              'DUPLICATE_NAME'
            );
          }
        }

        const updatedGroup = {
          ...group,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? updatedGroup : g
          ),
        }));

        useAuditStore.getState().addLog({
          action: 'GROUP_UPDATE',
          details: `Updated group "${group.name}"`,
          accountName: 'System',
          status: 'success',
        });

        return updatedGroup;
      },

      addServersToGroup: async (groupId, serverIds) => {
        const group = get().getGroupById(groupId);
        if (!group) {
          throw createGroupValidationError(
            'Group not found',
            'INVALID_GROUP'
          );
        }

        // Check if any server is already in another group
        for (const serverId of serverIds) {
          const existingGroups = get().getGroupsForServer(serverId);
          if (existingGroups.length > 0) {
            throw createGroupValidationError(
              `Server ${serverId} is already in group "${existingGroups[0].name}"`,
              'SERVER_ALREADY_GROUPED'
            );
          }
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  serverIds: [...new Set([...g.serverIds, ...serverIds])],
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        }));

        useAuditStore.getState().addLog({
          action: 'GROUP_ADD_SERVERS',
          details: `Added ${serverIds.length} servers to group "${group.name}"`,
          accountName: 'System',
          status: 'success',
          affectedServers: serverIds,
        });
      },

      removeServersFromGroup: async (groupId, serverIds) => {
        const group = get().getGroupById(groupId);
        if (!group) {
          throw createGroupValidationError(
            'Group not found',
            'INVALID_GROUP'
          );
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  serverIds: g.serverIds.filter(
                    (id) => !serverIds.includes(id)
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        }));

        useAuditStore.getState().addLog({
          action: 'GROUP_REMOVE_SERVERS',
          details: `Removed ${serverIds.length} servers from group "${group.name}"`,
          accountName: 'System',
          status: 'success',
          affectedServers: serverIds,
        });
      },

      getGroupById: (id) => {
        return get().groups.find((g) => g.id === id);
      },

      getGroupByName: (name) => {
        return get().groups.find(
          (g) => g.name.toLowerCase() === name.toLowerCase()
        );
      },

      getGroupsForServer: (serverId) => {
        return get().groups.filter((g) => g.serverIds.includes(serverId));
      },

      validateGroupName: (name, excludeGroupId) => {
        const existingGroup = get().getGroupByName(name);
        return !existingGroup || existingGroup.id === excludeGroupId;
      },
    }),
    {
      name: 'server-groups',
      version: 2,
    }
  )
);