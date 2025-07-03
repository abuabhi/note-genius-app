
import React, { useEffect } from 'react';
import { QueryProvider } from './components/app/QueryProvider';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { HelpProvider } from './contexts/HelpContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProductionOptimizationProvider } from '@/components/performance/ProductionOptimizationProvider';
import AppRoutes from './components/app/AppRoutes';
import { useNotificationToasts } from '@/hooks/useNotificationToasts';

function AppContent() {
  useNotificationToasts(); // Move this inside the providers
  
  useEffect(() => {
    document.title = 'PrepGenie';
  }, []);

  return (
    <div className="App min-h-screen bg-gray-50 w-full">
      <AppRoutes />
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProductionOptimizationProvider>
          <SubscriptionProvider>
            <HelpProvider>
              <SidebarProvider>
                <AppContent />
              </SidebarProvider>
            </HelpProvider>
          </SubscriptionProvider>
        </ProductionOptimizationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
