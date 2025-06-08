
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { EnhancedQueryProvider } from './EnhancedQueryProvider';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { AlertManager } from '@/components/monitoring/AlertManager';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ConnectionStatus } from '@/components/performance/ConnectionManager';
import { UpdateNotification } from '@/components/performance/ServiceWorkerManager';
import { PerformanceDebugger } from '@/components/performance/PerformanceMonitor';
import { HealthCheck } from '@/components/monitoring/HealthCheck';
import { config } from '@/config/environment';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ErrorProvider>
      <EnhancedQueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <AlertManager>
              {children}
              <ConnectionStatus />
              <UpdateNotification />
              {config.features.enablePerformanceMonitoring && <PerformanceDebugger />}
              {(config.isDevelopment || config.isStaging) && (
                <div className="fixed bottom-4 left-4 z-50">
                  <HealthCheck />
                </div>
              )}
              <Toaster />
              <SonnerToaster />
            </AlertManager>
          </AuthProvider>
        </BrowserRouter>
      </EnhancedQueryProvider>
    </ErrorProvider>
  );
};
