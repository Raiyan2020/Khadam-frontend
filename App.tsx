import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { LanguageProvider } from './i18n';
import { ThemeProvider } from './theme';
import { FavoritesProvider } from './FavoritesContext';
import { UserRoleProvider } from './UserRoleContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserRoleProvider>
          <FavoritesProvider>
            <RouterProvider router={router} />
          </FavoritesProvider>
        </UserRoleProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;