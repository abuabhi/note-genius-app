
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HelpState, HelpContent, HelpContext as HelpContextType } from '@/types/help';
import { getHelpByContext } from '@/data/helpContent';
import { useLocation } from 'react-router-dom';
import { useHelpAnalytics } from '@/hooks/help/useHelpAnalytics';

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
  if (pathname.includes('/notes/study/')) return 'note-study';
  if (pathname === '/flashcards') return 'flashcards-list';
  if (pathname === '/study-sessions') return 'study-session';
  if (pathname === '/progress') return 'progress-overview';
  if (pathname === '/settings') return 'settings';
  return null;
};

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const analytics = useHelpAnalytics();
  
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
      if (!state.currentContext) return [];
      return getHelpByContext(state.currentContext);
    } catch (error) {
      console.error('Error getting contextual help:', error);
      return [];
    }
  }, [state.currentContext]);

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
