import TelegramBot from 'node-telegram-bot-api';
import { ENV } from './config';
import { setupCommands } from './commands';

const bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN, { polling: true });

setupCommands(bot);

console.log('🤖 Bot is running...');

// Handle errors
bot.on('error', (error) => {
  console.error('Telegram Bot Error:', error);
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling Error:', error);
});