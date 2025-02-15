import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RdpApiClient } from '../client';
import { RdpApiError, RateLimitError } from '../error';
import type { Server, PowerResponse } from '../types';

describe('RdpApiClient', () => {
  let client: RdpApiClient;

  beforeEach(() => {
    client = new RdpApiClient('test-api-key', {
      baseURL: 'https://api.test.com',
    });
  });

  describe('Server Management', () => {
    it('should list servers successfully', async () => {
      const mockServers: Server[] = [
        {
          id: 'server-1',
          node: 'node-1',
          rdns: 'server-1.test.com',
          distro: 'ubuntu-20.04',
          status: 'running',
          plan_id: 1,
          created_at: '2024-02-28T00:00:00Z',
          ip_address: '1.2.3.4',
          expiry_date: '2025-02-28T00:00:00Z',
        },
      ];

      // Mock the axios get request
      vi.spyOn(client['axios'], 'get').mockResolvedValueOnce({ data: mockServers });

      const servers = await client.listServers();
      expect(servers).toEqual(mockServers);
    });

    it('should handle API errors correctly', async () => {
      vi.spyOn(client['axios'], 'get').mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            message: 'Invalid API key',
            code: 'UNAUTHORIZED',
          },
        },
      });

      await expect(client.listServers()).rejects.toThrow(RdpApiError);
    });
  });

  describe('Power Management', () => {
    it('should handle power actions correctly', async () => {
      const mockResponse: PowerResponse = { status: true };
      vi.spyOn(client['axios'], 'post').mockResolvedValueOnce({ data: mockResponse });

      const response = await client.powerAction('server-1', 'start');
      expect(response).toEqual(mockResponse);
    });

    it('should validate power state', async () => {
      // @ts-expect-error Testing invalid power state
      await expect(client.powerAction('server-1', 'invalid')).rejects.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting', async () => {
      // Mock rate limiter to always throw
      vi.spyOn(client['rateLimiter'], 'checkLimit').mockRejectedValueOnce(
        new RateLimitError()
      );

      await expect(client.listServers()).rejects.toThrow(RateLimitError);
    });
  });
});