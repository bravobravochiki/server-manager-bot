import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { ENV } from './config';

const redis = new Redis(ENV.REDIS_URL);

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit',
  points: 30, // Number of points
  duration: 60, // Per 60 seconds
});

export const checkRateLimit = async (userId: number): Promise<boolean> => {
  try {
    await rateLimiter.consume(`user:${userId}`);
    return true;
  } catch (error) {
    return false;
  }
};