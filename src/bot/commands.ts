import TelegramBot from 'node-telegram-bot-api';
import { RdpApiClient } from '../api/client';
import { ENV } from './config';
import { Storage } from './storage';
import { checkRateLimit } from './rate-limiter';

export const setupCommands = (bot: TelegramBot) => {
  // Middleware to check auth and rate limit
  const checkAuth = async (msg: TelegramBot.Message, action: () => Promise<void>) => {
    if (!ENV.ALLOWED_CHAT_IDS.includes(msg.chat.id)) {
      await bot.sendMessage(msg.chat.id, '⛔ Unauthorized access');
      return;
    }

    const isAllowed = await checkRateLimit(msg.from!.id);
    if (!isAllowed) {
      await bot.sendMessage(msg.chat.id, '⚠️ Please wait before sending more commands');
      return;
    }

    await action();
  };

  // Start command
  bot.onText(/\/start/, (msg) => {
    checkAuth(msg, async () => {
      const userData = await Storage.getUserData(msg.from!.id);
      
      if (!userData?.apiKey) {
        await bot.sendMessage(msg.chat.id,
          '👋 Welcome to the Server Manager Bot!\n\n' +
          'To get started, please set up your API key using:\n' +
          '/setapikey YOUR_API_KEY',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      await bot.sendMessage(msg.chat.id,
        '🖥️ *Server Manager*\n\n' +
        'Available commands:\n' +
        '/servers - List all servers\n' +
        '/start_server ID - Start a server\n' +
        '/stop_server ID - Stop a server\n' +
        '/reset_server ID - Reset a server\n' +
        '/stopall - Stop all running servers\n' +
        '/help - Show this message',
        { parse_mode: 'Markdown' }
      );
    });
  });

  // Set API key command
  bot.onText(/\/setapikey (.+)/, (msg, match) => {
    checkAuth(msg, async () => {
      const apiKey = match![1];
      
      try {
        // Test API key
        const client = new RdpApiClient(apiKey);
        await client.listServers();

        // Save API key
        await Storage.saveUserData(msg.from!.id, {
          apiKey,
          preferences: {
            notifications: true,
            autoRefresh: true,
            darkMode: false
          },
          lastActive: new Date().toISOString()
        });

        await bot.sendMessage(msg.chat.id,
          '✅ API key configured successfully!\n\n' +
          'Use /start to see available commands.',
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        await bot.sendMessage(msg.chat.id,
          '❌ Invalid API key. Please check your credentials and try again.',
          { parse_mode: 'Markdown' }
        );
      }
    });
  });

  // List servers command
  bot.onText(/\/servers/, (msg) => {
    checkAuth(msg, async () => {
      const userData = await Storage.getUserData(msg.from!.id);
      if (!userData?.apiKey) {
        await bot.sendMessage(msg.chat.id, '⚠️ Please set up your API key first using /setapikey');
        return;
      }

      try {
        const client = new RdpApiClient(userData.apiKey);
        const servers = await client.listServers();

        if (servers.length === 0) {
          await bot.sendMessage(msg.chat.id, 'No servers found.');
          return;
        }

        const serverList = servers.map(server => 
          `${server.status === 'running' ? '🟢' : '⚫'} *${server.rdns || server.id}*\n` +
          `IP: \`${server.ip_address}\`\n` +
          `Status: ${server.status}\n` +
          `Distro: ${server.distro}\n` +
          `Expires: ${new Date(server.expiry_date).toLocaleDateString()}\n`
        ).join('\n');

        await bot.sendMessage(msg.chat.id, serverList, { parse_mode: 'Markdown' });
      } catch (error) {
        await bot.sendMessage(msg.chat.id, '❌ Failed to fetch servers. Please try again.');
      }
    });
  });

  // Server power commands
  const powerCommands = {
    '/start_server': 'start',
    '/stop_server': 'stop',
    '/reset_server': 'reset'
  } as const;

  Object.entries(powerCommands).forEach(([command, action]) => {
    bot.onText(new RegExp(`${command} (.+)`), (msg, match) => {
      checkAuth(msg, async () => {
        const userData = await Storage.getUserData(msg.from!.id);
        if (!userData?.apiKey) {
          await bot.sendMessage(msg.chat.id, '⚠️ Please set up your API key first using /setapikey');
          return;
        }

        const serverId = match![1];
        try {
          const client = new RdpApiClient(userData.apiKey);
          await client.powerAction(serverId, action);
          await bot.sendMessage(msg.chat.id, `✅ Server ${action} command sent successfully.`);
        } catch (error) {
          await bot.sendMessage(msg.chat.id, `❌ Failed to ${action} server. Please check the server ID and try again.`);
        }
      });
    });
  });

  // Stop all servers command
  bot.onText(/\/stopall/, (msg) => {
    checkAuth(msg, async () => {
      const userData = await Storage.getUserData(msg.from!.id);
      if (!userData?.apiKey) {
        await bot.sendMessage(msg.chat.id, '⚠️ Please set up your API key first using /setapikey');
        return;
      }

      try {
        const client = new RdpApiClient(userData.apiKey);
        const servers = await client.listServers();
        const runningServers = servers.filter(s => s.status === 'running');

        if (runningServers.length === 0) {
          await bot.sendMessage(msg.chat.id, 'No running servers found.');
          return;
        }

        const confirmMessage = await bot.sendMessage(msg.chat.id,
          `⚠️ Are you sure you want to stop ${runningServers.length} running servers?\n\n` +
          'This action cannot be undone.',
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Yes, stop all', callback_data: 'confirm_stopall' },
                  { text: '❌ Cancel', callback_data: 'cancel_stopall' }
                ]
              ]
            }
          }
        );

        // Store the confirmation context
        await Storage.saveConfirmationContext(msg.from!.id, {
          action: 'stopall',
          messageId: confirmMessage.message_id,
          serverIds: runningServers.map(s => s.id)
        });
      } catch (error) {
        await bot.sendMessage(msg.chat.id, '❌ Failed to fetch servers. Please try again.');
      }
    });
  });

  // Handle callback queries (button clicks)
  bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const userId = query.from.id;

    if (!await checkRateLimit(userId)) {
      await bot.answerCallbackQuery(query.id, {
        text: '⚠️ Please wait before sending more commands',
        show_alert: true
      });
      return;
    }

    const userData = await Storage.getUserData(userId);
    if (!userData?.apiKey) {
      await bot.answerCallbackQuery(query.id, {
        text: '⚠️ Please set up your API key first using /setapikey',
        show_alert: true
      });
      return;
    }

    if (query.data === 'confirm_stopall') {
      const context = await Storage.getConfirmationContext(userId);
      if (!context || context.action !== 'stopall') {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Confirmation expired. Please try again.',
          show_alert: true
        });
        return;
      }

      try {
        const client = new RdpApiClient(userData.apiKey);
        const results = await Promise.allSettled(
          context.serverIds.map(serverId => client.powerAction(serverId, 'stop'))
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failedCount = results.filter(r => r.status === 'rejected').length;

        await bot.editMessageText(
          `✅ Stopped ${successCount} servers\n` +
          (failedCount > 0 ? `❌ Failed to stop ${failedCount} servers` : ''),
          {
            chat_id: chatId,
            message_id: context.messageId
          }
        );
      } catch (error) {
        await bot.editMessageText(
          '❌ Failed to stop servers. Please try again.',
          {
            chat_id: chatId,
            message_id: context.messageId
          }
        );
      }
    } else if (query.data === 'cancel_stopall') {
      const context = await Storage.getConfirmationContext(userId);
      if (context) {
        await bot.editMessageText(
          '❌ Operation cancelled.',
          {
            chat_id: chatId,
            message_id: context.messageId
          }
        );
      }
    }

    await Storage.clearConfirmationContext(userId);
    await bot.answerCallbackQuery(query.id);
  });
};