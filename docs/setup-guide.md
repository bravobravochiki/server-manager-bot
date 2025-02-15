# Server Manager Bot Setup Guide

## Overview

The Server Manager Bot is a Telegram bot that allows you to manage your RDP.sh servers directly from Telegram. It includes both a bot interface for quick commands and a web-based mini app for a full management experience.

## Features

- 🔐 Secure API key management
- 📊 Server status monitoring
- 🎮 Power control (start/stop/reset)
- 📱 Responsive web interface
- 🌙 Dark mode support
- ⚡ Batch operations
- 🔒 Rate limiting and security features

## Prerequisites

1. Node.js 18 or later
2. Redis server (for rate limiting and storage)
3. Telegram account
4. RDP.sh API key
5. Domain name (for the web interface)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/server-manager-bot
cd server-manager-bot
```

2. Install dependencies:
```bash
npm install
```

3. Generate encryption key:
```bash
npm run generate-key
```

4. Create a `.env` file:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
ALLOWED_CHAT_IDS=123456789,987654321
WEBAPP_URL=https://your-webapp-url.com
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=your_generated_key_here
```

5. Build and start the bot:
```bash
npm run build
npm run start:bot
```

## Detailed Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for "@BotFather"
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "Server Manager")
4. Choose a username (must end in "bot", e.g., "servermanagerbot")
5. Save the bot token provided by BotFather

### 2. Configure the Web App

1. Deploy the web app to Netlify:
   - Connect your GitHub repository
   - Set build command to `npm run build`
   - Set publish directory to `dist`
   - Add environment variables in Netlify dashboard

2. Configure the bot's web app:
   - Send `/setmenubutton` to BotFather
   - Select your bot
   - Set the button text (e.g., "Open Manager")
   - Set the URL to your deployed web app

### 3. Set Up Redis

1. Local development:
   ```bash
   # Install Redis
   sudo apt-get install redis-server
   
   # Start Redis
   sudo systemctl start redis
   ```

2. Production:
   - Use a managed Redis service (e.g., Redis Labs)
   - Update REDIS_URL in your environment variables

### 4. Security Configuration

1. Get your Telegram user ID:
   - Send a message to @userinfobot
   - Copy your ID number

2. Update allowed chat IDs:
   - Add your ID to ALLOWED_CHAT_IDS in .env
   - Add other admin IDs if needed

3. Test the security:
   - Try using the bot from an unauthorized account
   - Verify that rate limiting works

## Bot Commands

- `/start` - Show available commands
- `/setapikey KEY` - Configure your RDP.sh API key
- `/servers` - List all servers
- `/start_server ID` - Start a specific server
- `/stop_server ID` - Stop a specific server
- `/reset_server ID` - Reset a specific server
- `/stopall` - Stop all running servers

## Web Interface

The web interface provides a full management experience:

1. Server Management:
   - View all servers with status
   - Start/stop/reset individual servers
   - Batch operations
   - Search and filter servers

2. Account Management:
   - Multiple API key support
   - Quick account switching
   - Secure key storage

3. Preferences:
   - Dark/light mode
   - Auto-refresh settings
   - Mobile-optimized layout

## Deployment

### Netlify Deployment

1. Connect to GitHub:
   - Log in to Netlify
   - Click "New site from Git"
   - Select your repository

2. Configure build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. Set environment variables:
   - Go to Site settings > Build & deploy > Environment
   - Add all required variables from .env

4. Deploy:
   - Trigger deploy from Netlify dashboard
   - Wait for build completion
   - Test the web app URL

### Bot Deployment

1. Server setup:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Redis
   sudo apt-get install redis-server

   # Clone and setup
   git clone https://github.com/yourusername/server-manager-bot
   cd server-manager-bot
   npm install
   ```

2. Process management:
   ```bash
   # Install PM2
   npm install -g pm2

   # Start bot
   pm2 start npm --name "server-manager-bot" -- run start:bot

   # Enable startup
   pm2 startup
   pm2 save
   ```

## Troubleshooting

1. Bot not responding:
   - Check TELEGRAM_BOT_TOKEN
   - Verify bot is running
   - Check error logs

2. Redis connection issues:
   - Verify Redis is running
   - Check REDIS_URL format
   - Test Redis connection

3. Web app problems:
   - Check browser console
   - Verify environment variables
   - Test API connectivity

## Maintenance

1. Regular updates:
   ```bash
   # Update dependencies
   npm update

   # Check for vulnerabilities
   npm audit

   # Update bot
   git pull
   npm install
   pm2 restart server-manager-bot
   ```

2. Monitoring:
   ```bash
   # Check bot status
   pm2 status

   # View logs
   pm2 logs server-manager-bot

   # Monitor resources
   pm2 monit
   ```

3. Backup:
   - Regular Redis backups
   - Environment variable backup
   - Configuration backup

## Support

For issues and support:
1. Check the troubleshooting guide
2. Review error logs
3. Open an issue on GitHub
4. Contact the maintainers

Remember to never share your API keys or tokens publicly!