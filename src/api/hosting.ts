import axios from 'axios';
import type { Server, PowerState, PowerResponse } from '../types';

export const createHostingApi = (apiKey: string) => {
  const api = axios.create({
    baseURL: 'https://api.rdp.sh',
    headers: {
      Authorization: apiKey,
    },
  });

  return {
    getServers: async (): Promise<Server[]> => {
      const response = await api.get<Server[]>('/servers');
      return response.data;
    },

    getServer: async (serverId: string): Promise<Server> => {
      const response = await api.get<Server>(`/servers/${serverId}`);
      return response.data;
    },

    powerServer: async (serverId: string, state: PowerState): Promise<PowerResponse> => {
      const response = await api.post<PowerResponse>(`/servers/${serverId}/power/${state}`);
      return response.data;
    },
  };
};