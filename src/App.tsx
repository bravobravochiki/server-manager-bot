import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ApiKeyLogin } from './components/ApiKeyLogin';
import { useAccountsStore } from './store/accounts';
import { usePreferencesStore } from './store/preferences';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import { DesktopLayout } from './components/DesktopLayout';
import { MobileLayout } from './components/mobile/MobileLayout';

function App() {
  const { activeAccount } = useAccountsStore();
  const { darkMode } = usePreferencesStore();
  const { isMobile } = useTelegramWebApp();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ErrorBoundary>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </ErrorBoundary>
  );
}

export default App;