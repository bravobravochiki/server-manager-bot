import React from 'react';
import { useAccountsStore } from '../../store/accounts';
import { usePreferencesStore } from '../../store/preferences';
import { MobileHeader } from './MobileHeader';
import { MobileNavigation } from './MobileNavigation';
import { MobileServerList } from './MobileServerList';
import { MobileSearch } from './MobileSearch';
import { MobileFilters } from './MobileFilters';
import { MobileAccountSheet } from './MobileAccountSheet';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

export function MobileLayout() {
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [filtersVisible, setFiltersVisible] = React.useState(false);
  const [accountSheetVisible, setAccountSheetVisible] = React.useState(false);
  const { activeAccount } = useAccountsStore();
  const { darkMode } = usePreferencesStore();
  const { webApp } = useTelegramWebApp();

  React.useEffect(() => {
    if (webApp) {
      webApp.expand();
      webApp.ready();
    }
  }, [webApp]);

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background p-4">
        <MobileAccountSheet
          isOpen={true}
          onClose={() => {}}
          showCloseButton={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
      <MobileHeader
        onSearchClick={() => setSearchVisible(true)}
        onFilterClick={() => setFiltersVisible(true)}
        onAccountClick={() => setAccountSheetVisible(true)}
      />

      <main className="pt-16 pb-20">
        <MobileServerList />
      </main>

      <MobileNavigation
        onSearchClick={() => setSearchVisible(true)}
        onFilterClick={() => setFiltersVisible(true)}
      />

      <MobileSearch
        isOpen={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      <MobileFilters
        isOpen={filtersVisible}
        onClose={() => setFiltersVisible(false)}
      />

      <MobileAccountSheet
        isOpen={accountSheetVisible}
        onClose={() => setAccountSheetVisible(false)}
      />
    </div>
  );
}