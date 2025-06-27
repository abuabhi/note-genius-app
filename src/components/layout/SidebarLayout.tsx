
import React from 'react';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AuthSidebar from './AuthSidebar';
import Footer from './Footer';
import { UnifiedSessionDock } from '@/components/ui/floating/UnifiedSessionDock';
import { HelpFloatingButton } from '@/components/help/HelpFloatingButton';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';
import { UserSection } from '@/components/ui/sidebar/UserSection';
import { useHelp } from '@/contexts/HelpContext';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  // Safely use help context
  let helpContext = null;
  try {
    helpContext = useHelp();
  } catch (error) {
    console.warn('Help context not available:', error);
  }

  const handleHelpClick = () => {
    if (helpContext?.openHelp) {
      const contextualHelp = helpContext.getContextualHelp?.() || [];
      if (contextualHelp.length > 0) {
        helpContext.openHelp(contextualHelp[0]);
      } else {
        helpContext.openHelp();
      }
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-mint-50 via-white to-blue-50">
      <AuthSidebar />
      <SidebarInset className="flex-1 flex flex-col">
        {/* Header with sidebar trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">PrepGenie</h1>
          </div>
          
          {/* Header Right Side - Action buttons and Profile */}
          <div className="ml-auto flex items-center space-x-3">
            {/* Action buttons with subtle styling */}
            <div className="flex items-center space-x-2 bg-gray-50/60 rounded-full px-3 py-1 backdrop-blur-sm border border-gray-200/50">
              {/* Reminder Bell Icon */}
              <ReminderNavPopover />
              
              {/* Help Icon */}
              {helpContext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHelpClick}
                  className="h-8 w-8 p-0 hover:bg-mint-100 rounded-full transition-colors"
                  title="Get Help"
                >
                  <HelpCircle className="h-4 w-4 text-mint-600" />
                </Button>
              )}
            </div>
            
            {/* User Profile Section */}
            <UserSection isCollapsed={false} />
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
