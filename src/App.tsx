
import React, { useEffect } from 'react';
import { QueryProvider } from './components/app/QueryProvider';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { HelpProvider } from './contexts/HelpContext';
import { ProductionOptimizationProvider } from '@/components/performance/ProductionOptimizationProvider';
import AppRoutes from './components/app/AppRoutes';
import { useNotificationToasts } from '@/hooks/useNotificationToasts';
import { useVersionLogger } from '@/hooks/useVersionLogger';
import { sentryService } from '@/services/sentry/sentryService';
import { securityHeadersManager } from '@/services/security/SecurityHeadersManager';

function AppContent() {
  useNotificationToasts(); // Move this inside the providers
  useVersionLogger(); // Log version info on app load
  
  useEffect(() => {
    document.title = 'PrepGenie';
    
    // Initialize Sentry
    sentryService.initialize().catch(console.error);
    
    // Force security headers initialization
    console.log('🔒 [APP] Initializing security headers...');
    console.log('🔒 [APP] SecurityHeadersManager instance:', securityHeadersManager);
  }, []);

  return <AppRoutes />;
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProductionOptimizationProvider>
          <SubscriptionProvider>
            <HelpProvider>
              <AppContent />
            </HelpProvider>
          </SubscriptionProvider>
        </ProductionOptimizationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
