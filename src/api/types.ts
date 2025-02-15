import { z } from 'zod';

// Server Types
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

// Power Management Types
export const powerStateSchema = z.enum(['reset', 'start', 'stop']);
export type PowerState = z.infer<typeof powerStateSchema>;

export interface PowerResponse {
  status: boolean;
}

// Balance Types
export const balanceResponseSchema = z.object({
  balance: z.string(),
});

export type BalanceResponse = z.infer<typeof balanceResponseSchema>;

// Plan Types
export interface Plan {
  id: number;
  cores: number;
  price: number;
  title: string;
  memory: number;
  storage: number;
}

// Stock Types
export interface StockInfo {
  region: {
    id: number;
    region: string;
    location: string;
  };
  stock: {
    available: boolean;
    stock: number;
    plan: Plan;
  };
}

// Region Types
export interface Region {
  id: number;
  region: string;
  location: string;
}

// Distribution Types
export interface Distribution {
  id: number;
  description: string;
}

// Purchase Types
export const purchaseRequestSchema = z.object({
  distro_id: z.number().int().positive(),
  region_id: z.number().int().positive(),
  plan_id: z.number().int().positive(),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;

export interface PurchaseResponse {
  success: boolean;
  server_id: number;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}