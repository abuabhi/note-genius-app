
import React, { useEffect } from 'react';
import { QueryProvider } from './components/app/QueryProvider';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

import { ProductionOptimizationProvider } from '@/components/performance/ProductionOptimizationProvider';
import AppRoutes from './components/app/AppRoutes';
import { useNotificationToasts } from '@/hooks/useNotificationToasts';
import { useVersionLogger } from '@/hooks/useVersionLogger';
import { sentryService } from '@/services/sentry/sentryService';

function AppContent() {
  useNotificationToasts(); // Move this inside the providers
  useVersionLogger(); // Log version info on app load
  
  useEffect(() => {
    document.title = 'PrepGenie';

    // Defer Sentry init until the browser is idle so it doesn't block first paint
    const initSentry = () => sentryService.initialize().catch(console.error);
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(initSentry, { timeout: 4000 });
    } else {
      setTimeout(initSentry, 2000);
    }
  }, []);

  return <AppRoutes />;
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProductionOptimizationProvider>
          <SubscriptionProvider>
            <AppContent />
          </SubscriptionProvider>
        </ProductionOptimizationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
