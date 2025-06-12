
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
import { HelpProvider } from '@/contexts/HelpContext';
import { GuideProvider } from '@/contexts/GuideContext';
import { HelpDialog } from '@/components/help/HelpDialog';
import { HelpFloatingButton } from '@/components/help/HelpFloatingButton';
import { GuideOverlay } from '@/components/guide/GuideOverlay';
import { GuideFloatingButton } from '@/components/guide/GuideFloatingButton';
import { useAuth } from '@/contexts/auth';
import { config } from '@/config/environment';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

const HelpAndGuideComponents = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <>
      {/* Help System - shows for authenticated users */}
      <HelpDialog />
      <HelpFloatingButton />
      
      {/* Guide System - shows for authenticated users */}
      <GuideOverlay />
      <GuideFloatingButton />
    </>
  );
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ErrorProvider>
      <EnhancedQueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <HelpProvider>
              <GuideProvider>
                <AlertManager>
                  {children}
                  <HelpAndGuideComponents />
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
              </GuideProvider>
            </HelpProvider>
          </AuthProvider>
        </BrowserRouter>
      </EnhancedQueryProvider>
    </ErrorProvider>
  );
};
