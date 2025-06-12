import { ReactNode, useEffect } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { CustomSidebar } from '@/components/ui/sidebar-custom';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { useReminderToasts } from '@/hooks/useReminderToasts';
import { AnnouncementBar } from '@/components/announcements/AnnouncementBar';
import { UnifiedFloatingTimer } from '@/components/study/UnifiedFloatingTimer';
import { HelpProvider } from '@/contexts/HelpContext';
import { HelpDialog } from '@/components/help/HelpDialog';
import { HelpFloatingButton } from '@/components/help/HelpFloatingButton';
import { GuideOverlay } from '@/components/guide/GuideOverlay';
import { GuideFloatingButton } from '@/components/guide/GuideFloatingButton';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export default function Layout({ children, showSidebar = true, showFooter = true }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  
  // Initialize reminder toasts for authenticated users on all pages
  useReminderToasts();

  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Show sidebar only for authenticated users on non-public routes
  const shouldShowSidebar = showSidebar && user && !isPublicRoute;

  return (
    <HelpProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        {/* Announcement Bar - shows for authenticated users */}
        {user && <AnnouncementBar />}
        <div className="flex flex-1">
          {shouldShowSidebar && <CustomSidebar />}
          <main className={`flex-1 ${shouldShowSidebar ? 'ml-16' : ''}`}>
            {children}
          </main>
        </div>
        {showFooter && <Footer />}
        
        {/* Help System - shows for authenticated users */}
        {user && (
          <>
            <HelpDialog />
            <HelpFloatingButton />
          </>
        )}
        
        {/* Guide System - shows for authenticated users */}
        {user && (
          <>
            <GuideOverlay />
            <GuideFloatingButton />
          </>
        )}
        
        {/* Unified Floating Timer - shows for authenticated users */}
        {user && <UnifiedFloatingTimer />}
      </div>
    </HelpProvider>
  );
}
