
import React, { ReactNode } from 'react';
import { QueryProvider } from '@/components/app/QueryProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

import { ErrorProvider } from '@/contexts/ErrorContext';
import { MonitoringProvider } from '@/providers/MonitoringProvider';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import SecurityErrorBoundary from '@/components/error/SecurityErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <MonitoringProvider>
      <SecurityErrorBoundary>
        <ErrorProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <SecurityProvider>
              <Toaster />
              {children}
            </SecurityProvider>
          </ThemeProvider>
        </ErrorProvider>
      </SecurityErrorBoundary>
    </MonitoringProvider>
  );
};
