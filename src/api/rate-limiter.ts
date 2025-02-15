import { RATE_LIMIT } from './config';
import { RateLimitError } from './error';

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests = RATE_LIMIT.maxRequests, timeWindow = RATE_LIMIT.perSeconds) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow * 1000; // Convert to milliseconds
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Remove expired timestamps
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`
      );
    }

    this.requests.push(now);
  }

  reset(): void {
    this.requests = [];
  }
}