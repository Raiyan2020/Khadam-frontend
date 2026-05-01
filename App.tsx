import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { LanguageProvider } from './i18n';
import { ThemeProvider } from './theme';
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
            <RouterProvider router={router} />
            <Toaster
              position="top-center"
              toastOptions={{
                classNames: {
                  toast: '!bg-background !border-border !text-primary !shadow-lg !rounded-xl',
                  success: '!bg-white/90 !border-brand-500 !text-brand-500 [&_svg]:!text-brand-500',
                  error: '!bg-white/90 !border-red-500 !text-red-500 [&_svg]:!text-red-500',
                  warning: '!bg-white/90 !border-yellow-500 !text-yellow-500 [&_svg]:!text-yellow-500',
                }
              }}
            />
          </UserRoleProvider>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;