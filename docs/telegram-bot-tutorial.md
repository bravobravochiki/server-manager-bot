# Creating a Telegram Bot and Mini App: Complete Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Creating Your Bot](#creating-your-bot)
3. [Setting Up the Project](#setting-up-the-project)
4. [Configuring the Bot](#configuring-the-bot)
5. [Creating the Mini App](#creating-the-mini-app)
6. [Testing and Deployment](#testing-and-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

## Prerequisites

Before starting, ensure you have:

- Node.js 18 or later installed
- A Telegram account
- Basic knowledge of JavaScript/TypeScript
- A code editor (VS Code recommended)
- A Redis server for rate limiting and storage (optional)

## Creating Your Bot

1. Open Telegram and search for "@BotFather"
2. Start a chat with BotFather and use the `/newbot` command
3. Follow the prompts:
   - Enter a name for your bot (e.g., "Server Manager")
   - Choose a username (must end in "bot", e.g., "servermanagerbot")

> 📝 **Important**: Save your bot token! It looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`. You'll need this later.

![BotFather Chat](https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80)

## Setting Up the Project

1. Create a new directory and initialize the project:

```bash
mkdir telegram-bot-app
cd telegram-bot-app
npm init -y
```

2. Install required dependencies:

```json
{
  "dependencies": {
    "node-telegram-bot-api": "^0.65.1",
    "dotenv": "^16.4.5",
    "ioredis": "^5.3.2",
    "rate-limiter-flexible": "^5.0.0",
    "crypto-js": "^4.2.0",
    "zod": "^3.22.4"
  }
}
```

3. Create a `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
ALLOWED_CHAT_IDS=123456789,987654321
WEBAPP_URL=https://your-webapp-url.com
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=your_secure_encryption_key_here
```

> ⚠️ **Warning**: Never commit your `.env` file to version control!

## Configuring the Bot

1. Create a basic bot configuration (`src/bot/config.ts`):

```typescript
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
```

2. Set up the bot instance (`src/bot/index.ts`):

```typescript
import TelegramBot from 'node-telegram-bot-api';
import { ENV } from './config';

const bot = new TelegramBot(ENV.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Bot is running...');

// Handle errors
bot.on('error', (error) => {
  console.error('Telegram Bot Error:', error);
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling Error:', error);
});
```

## Creating the Mini App

1. Set up the web application:

```bash
npm create vite@latest webapp -- --template react-ts
cd webapp
```

2. Add the Telegram Web App script to `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#2481cc" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>Telegram Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

3. Create a hook for Telegram Web App integration (`src/hooks/useTelegramWebApp.ts`):

```typescript
import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  platform: string;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 428);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { webApp, isMobile };
}
```

## Testing and Deployment

1. Test the bot locally:

```bash
# Start the bot
npm run start:bot

# Start the web app
cd webapp
npm run dev
```

2. Configure your bot's web app URL in BotFather:
   - Use `/mybots` command
   - Select your bot
   - Go to "Bot Settings" > "Menu Button"
   - Set the web app URL

> 🔍 **Note**: For local testing, use a service like ngrok to create a public URL.

3. Deploy your bot:
   - Set up a server (e.g., DigitalOcean, Heroku)
   - Configure environment variables
   - Set up SSL certificate
   - Deploy both bot and web app

## Troubleshooting

Common issues and solutions:

1. **Bot not responding**
   - Check if the bot token is correct
   - Ensure the bot is running
   - Check for errors in the console

2. **Web app not loading**
   - Verify the Telegram Web App script is loaded
   - Check browser console for errors
   - Ensure HTTPS is configured correctly

3. **Rate limiting issues**
   - Configure Redis properly
   - Adjust rate limit settings
   - Check Redis connection

## Next Steps

1. Add more features to your bot:
   - Inline queries
   - Custom keyboards
   - File handling
   - Database integration

2. Enhance your mini app:
   - Add authentication
   - Implement more Telegram UI components
   - Add offline support
   - Optimize performance

## Additional Resources

- [Official Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Bot Development Best Practices](https://core.telegram.org/bots/features)
- [Sample Bot Code Repository](https://github.com/your-username/telegram-bot-example)

---

Remember to:
- Keep your bot token secure
- Follow Telegram's terms of service
- Test thoroughly before deployment
- Monitor bot performance
- Keep dependencies updated