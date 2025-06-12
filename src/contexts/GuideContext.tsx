
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GuideState, Guide, GuideStep, GuideContext as GuideContextType } from '@/types/guide';
import { getGuidesForContext, getGuideById } from '@/data/guideContent';
import { useLocation } from 'react-router-dom';
import { useGuideAnalytics } from '@/hooks/guide/useGuideAnalytics';
import { useAuth } from '@/contexts/auth';

interface GuideContextValue extends GuideState {
  startGuide: (guideId: string) => void;
  stopGuide: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  skipGuide: () => void;
  completeGuide: () => void;
  markGuideAsCompleted: (guideId: string) => void;
  getAvailableGuides: () => Guide[];
  isGuideCompleted: (guideId: string) => boolean;
  updateContext: (context: GuideContextType) => void;
}

const GuideContext = createContext<GuideContextValue | null>(null);

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};

const getContextFromPath = (pathname: string): GuideContextType | null => {
  if (pathname === '/') return 'dashboard';
  if (pathname.includes('/notes')) return 'notes';
  if (pathname.includes('/flashcards')) return 'flashcards';
  if (pathname.includes('/study')) return 'study';
  if (pathname.includes('/progress')) return 'progress';
  if (pathname.includes('/settings')) return 'settings';
  return null;
};

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const analytics = useGuideAnalytics();
  const { user } = useAuth();
  
  const [state, setState] = useState<GuideState>({
    isActive: false,
    currentGuide: null,
    currentStepIndex: 0,
    completedGuides: [],
    dismissedGuides: [],
    autoStartEnabled: true
  });

  const [currentContext, setCurrentContext] = useState<GuideContextType | null>(null);

  // Update context based on current route
  useEffect(() => {
    const context = getContextFromPath(location.pathname);
    setCurrentContext(context);
    console.log('Guide context updated:', { pathname: location.pathname, context });
  }, [location.pathname]);

  // Load completed guides from localStorage
  useEffect(() => {
    if (user) {
      const completed = localStorage.getItem(`completed_guides_${user.id}`);
      const dismissed = localStorage.getItem(`dismissed_guides_${user.id}`);
      
      setState(prev => ({
        ...prev,
        completedGuides: completed ? JSON.parse(completed) : [],
        dismissedGuides: dismissed ? JSON.parse(dismissed) : []
      }));
    }
  }, [user]);

  const startGuide = useCallback((guideId: string) => {
    console.log('Starting guide:', guideId);
    const guide = getGuideById(guideId);
    if (!guide) {
      console.warn('Guide not found:', guideId);
      return;
    }

    setState(prev => ({
      ...prev,
      isActive: true,
      currentGuide: guide,
      currentStepIndex: 0
    }));

    analytics.startGuide(guide);
    console.log('Guide started successfully:', guide.title);
  }, [analytics]);

  const stopGuide = useCallback(() => {
    console.log('Stopping guide');
    if (state.currentGuide) {
      analytics.stopGuide(state.currentGuide, state.currentStepIndex);
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      currentGuide: null,
      currentStepIndex: 0
    }));
  }, [analytics, state.currentGuide, state.currentStepIndex]);

  const nextStep = useCallback(() => {
    if (!state.currentGuide) return;

    const nextIndex = state.currentStepIndex + 1;
    
    if (nextIndex >= state.currentGuide.steps.length) {
      completeGuide();
      return;
    }

    setState(prev => ({
      ...prev,
      currentStepIndex: nextIndex
    }));

    analytics.trackStepCompletion(
      state.currentGuide, 
      state.currentStepIndex, 
      'next'
    );
  }, [state.currentGuide, state.currentStepIndex, analytics]);

  const previousStep = useCallback(() => {
    if (!state.currentGuide || state.currentStepIndex === 0) return;

    setState(prev => ({
      ...prev,
      currentStepIndex: prev.currentStepIndex - 1
    }));
  }, [state.currentGuide, state.currentStepIndex]);

  const skipStep = useCallback(() => {
    if (!state.currentGuide) return;

    analytics.trackStepCompletion(
      state.currentGuide, 
      state.currentStepIndex, 
      'skip'
    );

    nextStep();
  }, [state.currentGuide, state.currentStepIndex, analytics, nextStep]);

  const skipGuide = useCallback(() => {
    if (!state.currentGuide || !user) return;

    const dismissedGuides = [...state.dismissedGuides, state.currentGuide.id];
    localStorage.setItem(`dismissed_guides_${user.id}`, JSON.stringify(dismissedGuides));

    setState(prev => ({
      ...prev,
      dismissedGuides,
      isActive: false,
      currentGuide: null,
      currentStepIndex: 0
    }));

    analytics.skipGuide(state.currentGuide, state.currentStepIndex);
  }, [state.currentGuide, state.dismissedGuides, user, analytics]);

  const completeGuide = useCallback(() => {
    if (!state.currentGuide || !user) return;

    const completedGuides = [...state.completedGuides, state.currentGuide.id];
    localStorage.setItem(`completed_guides_${user.id}`, JSON.stringify(completedGuides));

    setState(prev => ({
      ...prev,
      completedGuides,
      isActive: false,
      currentGuide: null,
      currentStepIndex: 0
    }));

    analytics.completeGuide(state.currentGuide);
  }, [state.currentGuide, state.completedGuides, user, analytics]);

  const markGuideAsCompleted = useCallback((guideId: string) => {
    if (!user) return;

    const completedGuides = [...state.completedGuides, guideId];
    localStorage.setItem(`completed_guides_${user.id}`, JSON.stringify(completedGuides));

    setState(prev => ({
      ...prev,
      completedGuides
    }));
  }, [state.completedGuides, user]);

  const getAvailableGuides = useCallback((): Guide[] => {
    if (!currentContext) {
      console.log('No current context for guides');
      return [];
    }
    const guides = getGuidesForContext(currentContext);
    console.log('Available guides for context', currentContext, ':', guides);
    return guides;
  }, [currentContext]);

  const isGuideCompleted = useCallback((guideId: string): boolean => {
    return state.completedGuides.includes(guideId);
  }, [state.completedGuides]);

  const updateContext = useCallback((context: GuideContextType) => {
    setCurrentContext(context);
  }, []);

  const value: GuideContextValue = {
    ...state,
    startGuide,
    stopGuide,
    nextStep,
    previousStep,
    skipStep,
    skipGuide,
    completeGuide,
    markGuideAsCompleted,
    getAvailableGuides,
    isGuideCompleted,
    updateContext
  };

  return (
    <GuideContext.Provider value={value}>
      {children}
    </GuideContext.Provider>
  );
};
