
import { ReactNode, useEffect, useState } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { CustomSidebar } from '@/components/ui/sidebar-custom';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { useReminderToasts } from '@/hooks/useReminderToasts';
import { AnnouncementBar } from '@/components/announcements/AnnouncementBar';
import { EnhancedFloatingActionsHub } from '@/components/ui/floating/EnhancedFloatingActionsHub';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export default function Layout({ children, showSidebar = true, showFooter = true }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Initialize reminder toasts for authenticated users on all pages
  useReminderToasts();

  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Show sidebar only for authenticated users on non-public routes
  const shouldShowSidebar = showSidebar && user && !isPublicRoute;

  // Check if we're on a note study page to enable chat
  const isNoteStudyPage = location.pathname.includes('/notes/study/');

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
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
      
      {/* Single Enhanced Floating Actions Hub - handles all floating functionality */}
      <EnhancedFloatingActionsHub 
        onChatToggle={isNoteStudyPage ? handleChatToggle : undefined}
        isChatOpen={isChatOpen}
        hasUnreadChat={false}
      />
    </div>
  );
}
