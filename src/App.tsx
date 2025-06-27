
import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { AppProviders } from './components/app/AppProviders';
import { QueryProvider } from './components/app/QueryProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UnifiedSessionDock } from '@/components/ui/floating/UnifiedSessionDock';
import AppRoutes from './components/app/AppRoutes';

function App() {
  useEffect(() => {
    document.title = 'StudySphere';
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <AppProviders>
          <SidebarProvider>
            <div className="App min-h-screen bg-gray-50 w-full">
              <AppRoutes />
              {/* Floating Session Timer - Shows on all pages when active */}
              <UnifiedSessionDock />
            </div>
          </SidebarProvider>
        </AppProviders>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
