
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ConnectionStatus } from '@/components/performance/ConnectionManager';
import { UpdateNotification } from '@/components/performance/ServiceWorkerManager';
import { HealthCheck } from '@/components/monitoring/HealthCheck';
import { HelpDialog } from '@/components/help/HelpDialog';
import { config } from '@/config/environment';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      {children}
      
      {/* Help Dialog only - floating buttons now positioned in Layout */}
      <HelpDialog />
      
      <ConnectionStatus />
      <UpdateNotification />
      {(config.isDevelopment || config.isStaging) && (
        <div className="fixed bottom-4 left-4 z-50">
          <HealthCheck />
        </div>
      )}
      <SonnerToaster />
    </>
  );
};
