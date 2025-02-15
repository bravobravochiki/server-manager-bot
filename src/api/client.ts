import axios, { AxiosInstance, AxiosError } from 'axios';
import { RateLimiter } from './rate-limiter';
import { RdpApiError, RateLimitError } from './error';
import type { ApiConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import {
  Server,
  PowerState,
  PowerResponse,
  powerStateSchema,
  BalanceResponse,
  balanceResponseSchema,
  Plan,
  StockInfo,
  Region,
  Distribution,
  PurchaseRequest,
  PurchaseResponse,
  purchaseRequestSchema
} from './types';

export class RdpApiClient {
  public readonly axios: AxiosInstance;
  private readonly rateLimiter: RateLimiter;
  private readonly config: ApiConfig;

  constructor(apiKey: string, config: Partial<ApiConfig> = {}) {
    // Validate API key format
    if (!/^[A-Za-z0-9-_]{32,64}$/.test(apiKey)) {
      throw new RdpApiError({
        message: 'Invalid API key format',
        code: 'INVALID_API_KEY',
        status: 400
      });
    }

    this.config = { ...DEFAULT_CONFIG, ...config, apiKey };
    this.rateLimiter = new RateLimiter();

    this.axios = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        Authorization: this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    this.axios.interceptors.response.use(
      response => response,
      error => this.handleRequestError(error)
    );
  }

  async listServers(): Promise<Server[]> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() => 
        this.axios.get<Server[]>('/servers')
      );
      
      if (!Array.isArray(response.data)) {
        console.warn('Server response was not an array:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async getServer(serverId: string): Promise<Server> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() => 
        this.axios.get<Server>(`/servers/${serverId}`)
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async powerAction(serverId: string, state: PowerState): Promise<PowerResponse> {
    try {
      const validState = powerStateSchema.parse(state);
      
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() => 
        this.axios.post<PowerResponse>(`/servers/${serverId}/power/${validState}`)
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async getBalance(): Promise<BalanceResponse> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() =>
        this.axios.get<BalanceResponse>('/billing/balance')
      );

      const validatedResponse = balanceResponseSchema.parse(response.data);
      return validatedResponse;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async getPlans(): Promise<Plan[]> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() =>
        this.axios.get<Plan[]>('/plans')
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async getStock(): Promise<StockInfo[]> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() =>
        this.axios.get<StockInfo[]>('/stock')
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async getRegions(): Promise<Region[]> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() =>
        this.axios.get<Region[]>('/regions')
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async getDistros(): Promise<Distribution[]> {
    try {
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() =>
        this.axios.get<Distribution[]>('/distros')
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  async purchaseServer(request: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      const validatedRequest = purchaseRequestSchema.parse(request);
      
      await this.rateLimiter.checkLimit();
      const response = await this.retryRequest(() =>
        this.axios.post<PurchaseResponse>('/order', validatedRequest)
      );
      return response.data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw this.handleRequestError(error);
    }
  }

  private handleRequestError(error: unknown): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 500;
      const data = error.response?.data ?? {};
      
      if (!error.response) {
        throw new RdpApiError({
          message: 'Unable to connect to the server. Please check your internet connection.',
          code: 'NETWORK_ERROR',
          status: 0
        });
      }

      if (status === 401) {
        throw new RdpApiError({
          message: 'Invalid API key or unauthorized access. Please check your credentials.',
          code: 'UNAUTHORIZED',
          status
        });
      }

      if (status === 429) {
        throw new RateLimitError(
          data.message ?? 'Too many requests. Please try again later.'
        );
      }

      throw new RdpApiError({
        message: data.message ?? 'An error occurred while processing your request.',
        code: data.code ?? 'API_ERROR',
        status
      });
    }

    throw new RdpApiError({
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500
    });
  }

  private async retryRequest<T>(
    request: () => Promise<T>,
    retries = this.config.maxRetries
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(this.config.retryDelay!);
        return this.retryRequest(request, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof RateLimitError) {
      return false;
    }
    if (error instanceof AxiosError) {
      return !error.response || error.response.status >= 500;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}