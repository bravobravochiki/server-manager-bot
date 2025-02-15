export interface ApiConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export const DEFAULT_CONFIG: Partial<ApiConfig> = {
  baseURL: 'https://rdp.sh/api/v1',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

export const RATE_LIMIT = {
  maxRequests: 60,
  perSeconds: 60,
};