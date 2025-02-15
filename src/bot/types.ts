export interface Server {
  id: string;
  node: string;
  rdns: string;
  distro: string;
  status: string;
  plan_id: number;
  created_at: string;
  ip_address: string;
  expiry_date: string;
}

export type PowerState = 'reset' | 'start' | 'stop';

export interface PowerResponse {
  status: boolean;
}