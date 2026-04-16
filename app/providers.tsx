'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../theme';
import { LanguageProvider } from '../i18n';
import { FavoritesProvider } from '../FavoritesContext';
import { UserRoleProvider } from '../UserRoleContext';
import { SplashScreen } from '../components/SplashScreen';

export function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <UserRoleProvider>
            {showSplash && <SplashScreen />}
            {children}
          </UserRoleProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
