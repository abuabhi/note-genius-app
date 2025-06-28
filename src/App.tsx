
import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { AppProviders } from './components/app/AppProviders';
import { QueryProvider } from './components/app/QueryProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppRoutes from './components/app/AppRoutes';

function App() {
  useEffect(() => {
    document.title = 'PrepGenie';
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <AppProviders>
          <SidebarProvider>
            <div className="App min-h-screen bg-gray-50 w-full">
              <AppRoutes />
              {/* Session timer is now integrated into the sidebar */}
            </div>
          </SidebarProvider>
        </AppProviders>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
