import { Location } from 'react-router-dom';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

export interface ActivityData {
  type: ActivityType;
  startTime: number;
  endTime: number | null;
  duration: number;
  details?: any;
}

export interface GlobalSessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  currentActivity: ActivityData | null;
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
