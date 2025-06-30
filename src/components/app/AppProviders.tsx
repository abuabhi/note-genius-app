
import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { QueryProvider } from '@/components/app/QueryProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { HelpProvider } from '@/contexts/HelpContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { MonitoringProvider } from '@/providers/MonitoringProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <MonitoringProvider>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <HelpProvider>
              <ErrorProvider>
                <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                  <Toaster />
                  {children}
                </ThemeProvider>
              </ErrorProvider>
            </HelpProvider>
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </MonitoringProvider>
  );
};
