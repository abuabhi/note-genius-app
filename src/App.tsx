
import React, { useEffect } from 'react';
import { EnhancedQueryProvider } from './components/app/EnhancedQueryProvider';
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
    
    // Initialize Sentry
    sentryService.initialize().catch(console.error);
  }, []);

  return <AppRoutes />;
}

function App() {
  return (
    <EnhancedQueryProvider>
      <AuthProvider>
        <ProductionOptimizationProvider>
          <SubscriptionProvider>
            <AppContent />
          </SubscriptionProvider>
        </ProductionOptimizationProvider>
      </AuthProvider>
    </EnhancedQueryProvider>
  );
}

export default App;
