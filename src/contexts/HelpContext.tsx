
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HelpState, HelpContent, HelpContext as HelpContextType } from '@/types/help';
import { useLocation } from 'react-router-dom';
import { useHelpAnalytics } from '@/hooks/help/useHelpAnalytics';
import { useHelpTopics } from '@/hooks/help/useHelpTopics';

interface HelpContextValue extends HelpState {
  openHelp: (content?: HelpContent) => void;
  closeHelp: () => void;
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: 'text' | 'video' | 'tips') => void;
  getContextualHelp: () => HelpContent[];
  updateContext: (context: HelpContextType) => void;
}

const HelpContext = createContext<HelpContextValue | null>(null);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

const getContextFromPath = (pathname: string): HelpContextType | null => {
  if (pathname === '/') return 'dashboard';
  if (pathname === '/notes') return 'notes-list';
  if (pathname.includes('/notes/create')) return 'note-creation';
  if (pathname.includes('/notes/edit')) return 'note-editing';
  if (pathname.includes('/notes/study/')) return 'note-study';
  if (pathname === '/flashcards') return 'flashcards-list';
  if (pathname.includes('/flashcards/create')) return 'flashcard-creation';
  if (pathname.includes('/flashcards/study')) return 'flashcard-study';
  if (pathname === '/study-sessions') return 'study-session';
  if (pathname === '/progress') return 'progress-overview';
  if (pathname === '/settings') return 'settings';
  if (pathname.includes('/import')) return 'import';
  if (pathname.includes('/export')) return 'export';
  if (pathname.includes('/reminders')) return 'reminders';
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/chat')) return 'ai-chat';
  if (pathname.includes('/enhance')) return 'note-enhancement';
  return null;
};

// Helper function to extract YouTube ID from URL
const extractYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : url;
};

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const analytics = useHelpAnalytics();
  const { data: helpTopics = [] } = useHelpTopics();
  
  const [state, setState] = useState<HelpState>({
    isOpen: false,
    currentContent: null,
    currentContext: null,
    searchTerm: '',
    activeCategory: null,
    viewMode: 'text'
  });

  // Update context based on current route
  useEffect(() => {
    const context = getContextFromPath(location.pathname);
    if (context) {
      setState(prev => ({ ...prev, currentContext: context }));
    }
  }, [location.pathname]);

  // Start analytics session when help is opened
  const openHelp = useCallback((content?: HelpContent) => {
    try {
      setState(prev => ({
        ...prev,
        isOpen: true,
        currentContent: content || null,
        viewMode: content?.videoContent ? 'video' : 'text'
      }));

      // Track analytics with error handling
      if (analytics?.startHelpSession) {
        analytics.startHelpSession(state.currentContext || undefined);
      }
      if (content && analytics?.trackContentView) {
        analytics.trackContentView(content, state.currentContext || undefined);
      }
    } catch (error) {
      console.error('Error opening help:', error);
      // Still allow the help dialog to open even if analytics fails
      setState(prev => ({
        ...prev,
        isOpen: true,
        currentContent: content || null,
        viewMode: content?.videoContent ? 'video' : 'text'
      }));
    }
  }, [analytics, state.currentContext]);

  const closeHelp = useCallback(() => {
    try {
      setState(prev => ({
        ...prev,
        isOpen: false,
        currentContent: null,
        searchTerm: ''
      }));

      // End analytics session with error handling
      if (analytics?.endHelpSession) {
        analytics.endHelpSession();
      }
    } catch (error) {
      console.error('Error closing help:', error);
      // Still allow the help dialog to close even if analytics fails
      setState(prev => ({
        ...prev,
        isOpen: false,
        currentContent: null,
        searchTerm: ''
      }));
    }
  }, [analytics]);

  const setSearchTerm = useCallback((term: string) => {
    try {
      setState(prev => ({ ...prev, searchTerm: term }));
    } catch (error) {
      console.error('Error setting search term:', error);
    }
  }, []);

  const setViewMode = useCallback((mode: 'text' | 'video' | 'tips') => {
    try {
      setState(prev => ({ ...prev, viewMode: mode }));
    } catch (error) {
      console.error('Error setting view mode:', error);
    }
  }, []);

  const updateContext = useCallback((context: HelpContextType) => {
    try {
      setState(prev => ({ ...prev, currentContext: context }));
    } catch (error) {
      console.error('Error updating context:', error);
    }
  }, []);

  const getContextualHelp = useCallback((): HelpContent[] => {
    try {
      if (!state.currentContext || !helpTopics.length) return [];
      
      // Transform database HelpTopic to HelpContent and filter by context
      return helpTopics
        .map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          category: topic.category,
          context: [state.currentContext!], // Simplified context matching
          priority: topic.priority,
          textContent: topic.content,
          videoContent: topic.video_url ? {
            youtubeId: extractYouTubeId(topic.video_url),
            title: topic.video_title || topic.title,
            duration: topic.video_duration || '0:00',
            chapters: Array.isArray(topic.video_chapters) ? topic.video_chapters : [],
          } : undefined,
          quickTips: Array.isArray(topic.quick_tips) ? topic.quick_tips : [],
          tags: Array.isArray(topic.tags) ? topic.tags : [],
          lastUpdated: new Date(topic.updated_at).toISOString().split('T')[0]
        }))
        .filter(content => content.textContent); // Only show content with actual text
    } catch (error) {
      console.error('Error getting contextual help:', error);
      return [];
    }
  }, [state.currentContext, helpTopics]);

  const value: HelpContextValue = {
    ...state,
    openHelp,
    closeHelp,
    setSearchTerm,
    setViewMode,
    getContextualHelp,
    updateContext
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};
