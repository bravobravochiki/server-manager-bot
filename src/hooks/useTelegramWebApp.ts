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