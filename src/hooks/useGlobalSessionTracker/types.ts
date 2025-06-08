
import { Location } from 'react-router-dom';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

export interface ActivityData {
  type: ActivityType;
  startTime: number;
  endTime: number | null;
  duration: number;
  details?: any;
  // Add missing properties for compatibility
  cards_reviewed?: number;
  cards_correct?: number;
  quiz_score?: number;
  quiz_total_questions?: number;
  notes_created?: number;
  notes_reviewed?: number;
}

export interface GlobalSessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
}

export interface SessionContextProps {
  sessionState: GlobalSessionState;
  startSession: () => void;
  endSession: () => void;
  togglePause: () => void;
  recordActivity: (activityDetails: any) => void;
  updateSessionActivity: (activityDetails: any) => void;
  getCurrentActivityType: () => ActivityType;
  isOnStudyPage: boolean;
}

export interface NavigationEffectParams {
  sessionState: GlobalSessionState;
  location: Location;
  startSession: () => void;
  updateActivityType: () => void;
}

export interface TimerManagementParams {
  sessionState: GlobalSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>;
}

// Add notes routes to STUDY_ROUTES
export const STUDY_ROUTES = [
  '/flashcards',
  '/flashcards/*',
  '/notes',
  '/notes/*',
  '/quiz',
  '/quiz/*',
  '/study'
];

// Export the isStudyRoute function
export const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => {
    if (route.endsWith('/*')) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route;
  });
};
