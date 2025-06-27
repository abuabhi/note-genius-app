
import React from 'react';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AuthSidebar from './AuthSidebar';
import Footer from './Footer';
import { UnifiedSessionDock } from '@/components/ui/floating/UnifiedSessionDock';
import { HelpFloatingButton } from '@/components/help/HelpFloatingButton';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-mint-50 via-white to-blue-50">
      <AuthSidebar />
      <SidebarInset className="flex-1 flex flex-col">
        {/* Header with sidebar trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">StudySphere</h1>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        <Footer />
      </SidebarInset>
      
      {/* Floating Components */}
      <UnifiedSessionDock />
      <HelpFloatingButton />
    </div>
  );
};

export default SidebarLayout;
