
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { QueryProvider } from './QueryProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ConnectionStatus } from '@/components/performance/ConnectionManager';
import { UpdateNotification } from '@/components/performance/ServiceWorkerManager';
import { PerformanceDebugger } from '@/components/performance/PerformanceMonitor';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <ConnectionStatus />
          <UpdateNotification />
          <PerformanceDebugger />
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
};
