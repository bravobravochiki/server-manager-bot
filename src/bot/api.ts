import axios from 'axios';
import type { Server, PowerState, PowerResponse } from './types';
import { ENV } from './config';

const api = axios.create({
  baseURL: 'https://rdp.sh/api/v1',
  headers: {
    Authorization: ENV.HOSTING_API_KEY,
  },
});

export const getServers = async (): Promise<Server[]> => {
  const response = await api.get<Server[]>('/servers');
  return response.data;
};

export const getServer = async (serverId: string): Promise<Server> => {
  const response = await api.get<Server>(`/servers/${serverId}`);
  return response.data;
};

export const powerServer = async (serverId: string, state: PowerState): Promise<PowerResponse> => {
  const response = await api.post<PowerResponse>(`/servers/${serverId}/power/${state}`);
  return response.data;
};