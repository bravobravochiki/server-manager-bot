import Redis from 'ioredis';
import CryptoJS from 'crypto-js';
import { ENV } from './config';

const redis = new Redis(ENV.REDIS_URL);

interface UserData {
  apiKey: string;
  preferences: {
    notifications: boolean;
    autoRefresh: boolean;
    darkMode: boolean;
  };
  lastActive: string;
}

interface ConfirmationContext {
  action: string;
  messageId: number;
  serverIds: string[];
  timestamp: string;
}

export class Storage {
  private static encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, ENV.ENCRYPTION_KEY).toString();
  }

  private static decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENV.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static async saveUserData(userId: number, data: UserData): Promise<void> {
    const encryptedData = this.encryptData(JSON.stringify(data));
    await redis.set(`user:${userId}`, encryptedData);
  }

  static async getUserData(userId: number): Promise<UserData | null> {
    const encryptedData = await redis.get(`user:${userId}`);
    if (!encryptedData) return null;

    try {
      const decryptedData = this.decryptData(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting user data:', error);
      return null;
    }
  }

  static async saveConfirmationContext(userId: number, context: Omit<ConfirmationContext, 'timestamp'>): Promise<void> {
    const fullContext: ConfirmationContext = {
      ...context,
      timestamp: new Date().toISOString()
    };
    await redis.set(
      `confirm:${userId}`,
      JSON.stringify(fullContext),
      'EX',
      300 // Expire after 5 minutes
    );
  }

  static async getConfirmationContext(userId: number): Promise<ConfirmationContext | null> {
    const data = await redis.get(`confirm:${userId}`);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing confirmation context:', error);
      return null;
    }
  }

  static async clearConfirmationContext(userId: number): Promise<void> {
    await redis.del(`confirm:${userId}`);
  }
}