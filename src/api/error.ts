import type { ApiError } from './types';

export class RdpApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor({ message, code, status }: ApiError) {
    super(message);
    this.name = 'RdpApiError';
    this.code = code;
    this.status = status;
  }

  static isRdpApiError(error: unknown): error is RdpApiError {
    return error instanceof RdpApiError;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}