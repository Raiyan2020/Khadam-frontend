import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { LanguageProvider } from './i18n';
import { ThemeProvider, useTheme } from './theme';
import { UserRoleProvider } from './UserRoleContext';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NotificationHandler } from './components/NotificationHandler';

const queryClient = new QueryClient();

/** Reads resolvedTheme so Sonner reliably applies solid colors in both light and dark modes */
const ThemedToaster: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const base: React.CSSProperties = {
    background: isDark ? 'rgb(14,17,22)'   : 'rgb(248,250,252)',
    color:      isDark ? 'rgb(243,246,250)' : 'rgb(15,23,42)',
    border:     isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(148,163,184,0.3)',
    borderRadius: '16px',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.5)'
      : '0 8px 32px rgba(15,23,42,0.12)',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
  };

  return (
    <Toaster
      theme={resolvedTheme}
      position="top-center"
      toastOptions={{
        style: base,
        classNames: {
          success: '!border-[#9AAB89]   [&_[data-icon]]:!text-[#9AAB89]   [&_[data-title]]:!text-[#5a7a4a]',
          error:   '!border-red-500     [&_[data-icon]]:!text-red-500     [&_[data-title]]:!text-red-500',
          warning: '!border-yellow-500  [&_[data-icon]]:!text-yellow-500  [&_[data-title]]:!text-yellow-600',
        },
      }}
    />
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <UserRoleProvider>
            <NotificationHandler />
            <RouterProvider router={router} />
            <ThemedToaster />
          </UserRoleProvider>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;