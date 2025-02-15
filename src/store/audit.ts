import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  accountName: string;
  status: 'success' | 'failure';
  affectedServers?: string[];
}

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [
            {
              ...log,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
            ...state.logs,
          ],
        })),
    }),
    {
      name: 'audit-logs',
    }
  )
);