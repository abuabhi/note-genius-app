
import { ReactNode, useEffect, useState } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { CustomSidebar } from '@/components/ui/sidebar-custom';
import { useAuth } from '@/contexts/auth';
import { useLocation, useParams } from 'react-router-dom';
import { useReminderToasts } from '@/hooks/useReminderToasts';
import { AnnouncementBar } from '@/components/announcements/AnnouncementBar';
import { FloatingActionsHub } from '@/components/ui/floating/FloatingActionsHub';
import { NoteChatSidebar } from '@/components/notes/study/chat/NoteChatSidebar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export default function Layout({ children, showSidebar = true, showFooter = true }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Initialize reminder toasts for authenticated users on all pages
  useReminderToasts();

  // Define which routes are public - don't show dock on these
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Show sidebar only for authenticated users on non-public routes
  const shouldShowSidebar = showSidebar && user && !isPublicRoute;

  // Check if we're on a note study page to enable chat
  const isNoteStudyPage = location.pathname.includes('/notes/study/');
  const noteId = params.id; // Get note ID from URL params

  console.log('🏗️ Layout - Note study page detection:', {
    isNoteStudyPage,
    pathname: location.pathname,
    noteId,
    locationState: location.state
  });

  // Fetch current note data for chat when on study page
  const { data: currentNote } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId || !user) return null;
      
      console.log('📥 Fetching note for chat:', noteId);
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          tags:note_tags(
            tag:tags(*)
          )
        `)
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
        return null;
      }

      // Transform the data to match the Note interface
      const transformedNote = {
        ...data,
        sourceType: (data.source_type as 'manual' | 'scan' | 'import') || 'manual', // Properly cast to union type
        summary_status: (data.summary_status as 'pending' | 'generating' | 'completed' | 'failed') || 'pending', // Cast summary_status
        enriched_status: (data.enriched_status as 'pending' | 'generating' | 'completed' | 'failed') || 'pending', // Cast enriched_status
        tags: data.tags?.map((tagRelation: any) => ({
          id: tagRelation.tag.id,
          name: tagRelation.tag.name,
          color: tagRelation.tag.color
        })) || []
      };

      console.log('✅ Note fetched for chat:', transformedNote);
      return transformedNote;
    },
    enabled: isNoteStudyPage && !!noteId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleChatToggle = () => {
    console.log('🔄 Chat toggle called, current state:', isChatOpen);
    setIsChatOpen(!isChatOpen);
  };

  // Close chat when leaving study page
  useEffect(() => {
    if (!isNoteStudyPage) {
      setIsChatOpen(false);
    }
  }, [isNoteStudyPage]);

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
      
      {/* Floating Actions Dock - shows the proper dock instead of simple button */}
      <FloatingActionsHub 
        onChatToggle={isNoteStudyPage ? handleChatToggle : undefined}
        isChatOpen={isChatOpen}
        hasUnreadChat={false}
        showChat={isNoteStudyPage}
      />

      {/* Global Chat Sidebar - only shows on note study pages */}
      {isNoteStudyPage && currentNote && (
        <NoteChatSidebar
          note={currentNote}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
