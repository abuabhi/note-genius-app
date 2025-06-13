
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ConnectionStatus } from '@/components/performance/ConnectionManager';
import { UpdateNotification } from '@/components/performance/ServiceWorkerManager';
import { HealthCheck } from '@/components/monitoring/HealthCheck';
import { HelpDialog } from '@/components/help/HelpDialog';
import { SessionDock } from '@/components/ui/floating/SessionDock';
import { config } from '@/config/environment';
import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      {children}
      
      {/* Centralized Session Timer - only one instance */}
      <SessionDock />
      
      {/* Help Dialog */}
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
