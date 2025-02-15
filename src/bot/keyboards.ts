import TelegramBot from 'node-telegram-bot-api';
import type { Server } from './types';

export const mainMenuKeyboard = (): TelegramBot.InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '🖥️ View Servers', callback_data: 'servers:list' },
      { text: '⚡ Quick Actions', callback_data: 'actions:quick' }
    ],
    [
      { text: '⚙️ Settings', callback_data: 'settings:menu' },
      { text: '📊 Status', callback_data: 'status:view' }
    ],
    [
      { text: '🌐 Open Web App', web_app: { url: ENV.WEBAPP_URL } }
    ]
  ]
});

export const serverActionsKeyboard = (serverId: string): TelegramBot.InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '▶️ Start', callback_data: `server:${serverId}:start` },
      { text: '⏹️ Stop', callback_data: `server:${serverId}:stop` },
      { text: '🔄 Reset', callback_data: `server:${serverId}:reset` }
    ],
    [
      { text: '📋 Details', callback_data: `server:${serverId}:details` },
      { text: '🔙 Back', callback_data: 'servers:list' }
    ]
  ]
});

export const settingsKeyboard = (): TelegramBot.InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '🔑 API Key', callback_data: 'settings:apikey' },
      { text: '🔔 Notifications', callback_data: 'settings:notifications' }
    ],
    [
      { text: '🎨 Theme', callback_data: 'settings:theme' },
      { text: '⚡ Auto-Refresh', callback_data: 'settings:refresh' }
    ],
    [
      { text: '🔙 Back to Menu', callback_data: 'menu:main' }
    ]
  ]
});

export const serverListKeyboard = (servers: Server[]): TelegramBot.InlineKeyboardMarkup => ({
  inline_keyboard: [
    ...servers.map(server => ([{
      text: `${server.status === 'running' ? '🟢' : '⚫'} ${server.rdns || server.id}`,
      callback_data: `server:${server.id}:view`
    }])),
    [{ text: '🔄 Refresh', callback_data: 'servers:refresh' }],
    [{ text: '🔙 Main Menu', callback_data: 'menu:main' }]
  ]
});

export const confirmationKeyboard = (action: string): TelegramBot.InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '✅ Confirm', callback_data: `confirm:${action}` },
      { text: '❌ Cancel', callback_data: 'menu:main' }
    ]
  ]
});