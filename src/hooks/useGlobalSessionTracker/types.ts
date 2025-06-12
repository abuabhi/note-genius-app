
import { Location } from 'react-router-dom';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

export interface ActivityData {
  type: ActivityType;
  startTime: number;
  endTime: number | null;
  duration: number;
  details?: any;
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
  startTime: Date | null;
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

// Simplified study routes configuration
export const STUDY_ROUTES = [
  '/flashcards',
  '/notes',
  '/quiz',
  '/study'
];

// Simplified route checking - more precise matching
export const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => pathname.startsWith(route));
};
