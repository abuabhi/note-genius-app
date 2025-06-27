
import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { UnifiedSessionDock } from '@/components/ui/floating/UnifiedSessionDock';
import { HelpFloatingButton } from '@/components/help/HelpFloatingButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mint-50 via-white to-blue-50">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      
      {/* Floating Components */}
      <UnifiedSessionDock />
      <HelpFloatingButton />
    </div>
  );
};

export default Layout;
