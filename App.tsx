import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { LanguageProvider } from './i18n';
import { ThemeProvider } from './theme';
import { FavoritesProvider } from './FavoritesContext';
import { UserRoleProvider } from './UserRoleContext';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <UserRoleProvider>
            <FavoritesProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-center"
                toastOptions={{
                  classNames: {
                    toast: 'bg-background border border-border text-primary shadow-lg rounded-xl',
                    success: 'bg-brand-500/10 border-brand-500 text-brand-500',
                    error: 'bg-red-500/10 border-red-500 text-red-500',
                    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-500',
                  }
                }}
              />
            </FavoritesProvider>
          </UserRoleProvider>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;