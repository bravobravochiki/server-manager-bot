import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  ALLOWED_CHAT_IDS: z.string().transform(ids => ids.split(',').map(Number)),
  WEBAPP_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ENCRYPTION_KEY: z.string(),
});

export const ENV = envSchema.parse(process.env);