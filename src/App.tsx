import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { AppProviders } from './components/app/AppProviders';
import { QueryProvider } from './components/app/QueryProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppRoutes from './components/app/AppRoutes';
import { useNotificationToasts } from '@/hooks/useNotificationToasts';

function App() {
  useNotificationToasts(); // Add this line to enable notification toasts
  
  useEffect(() => {
    document.title = 'PrepGenie';
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <AppProviders>
            <SidebarProvider>
              <div className="App min-h-screen bg-gray-50 w-full">
                <AppRoutes />
                {/* Session timer is now integrated into the sidebar */}
              </div>
            </SidebarProvider>
          </AppProviders>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
