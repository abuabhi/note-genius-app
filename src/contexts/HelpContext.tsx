
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HelpState, HelpContent, HelpContext as HelpContextType } from '@/types/help';
import { getHelpByContext } from '@/data/helpContent';
import { useLocation } from 'react-router-dom';

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

  const openHelp = useCallback((content?: HelpContent) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      currentContent: content || null,
      viewMode: content?.videoContent ? 'video' : 'text'
    }));
  }, []);

  const closeHelp = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      currentContent: null,
      searchTerm: ''
    }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setViewMode = useCallback((mode: 'text' | 'video' | 'tips') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const updateContext = useCallback((context: HelpContextType) => {
    setState(prev => ({ ...prev, currentContext: context }));
  }, []);

  const getContextualHelp = useCallback((): HelpContent[] => {
    if (!state.currentContext) return [];
    return getHelpByContext(state.currentContext);
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
