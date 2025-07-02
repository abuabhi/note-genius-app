
import React from 'react';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AuthSidebar from './AuthSidebar';
import Footer from './Footer';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';
import { UserSection } from '@/components/ui/sidebar/UserSection';
import { Menu } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-mint-50 via-white to-blue-50">
      <AuthSidebar />
      
      {/* Main content area with smart footer positioning */}
      <div className="flex-1 flex flex-col min-h-screen">
        <SidebarInset className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger 
                className="p-2 hover:bg-mint-50 rounded-lg transition-colors duration-200 border border-gray-200/60 shadow-sm"
              >
                <Menu className="h-4 w-4 text-gray-600" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h1 className="text-xl font-bold">
                  <span className="text-mint-600">Prep</span>
                  <span className="text-gray-800">Genie</span>
                </h1>
              </div>
            </div>
            
            {/* Enhanced Header Right Side */}
            <div className="flex items-center gap-4">
              {/* Action buttons with enhanced styling */}
              <div className="flex items-center gap-2 bg-white/60 rounded-xl px-4 py-2 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                {/* Reminder Bell Icon */}
                <ReminderNavPopover />
              </div>
              
              {/* Enhanced User Profile Section */}
              <div className="bg-white/60 rounded-xl p-1 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                <UserSection isCollapsed={false} />
              </div>
            </div>
          </header>
          
          {/* Main content with smart layout grid */}
          <div className="flex-1 grid grid-rows-[1fr_auto] min-h-0">
            <main className="overflow-auto">
              {children}
            </main>
            
            {/* Smart Footer - adapts based on content */}
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </div>
  );
};

export default SidebarLayout;
