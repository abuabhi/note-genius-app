
export type ActivityType = 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general';

export interface GlobalSessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
}

export interface ActivityData {
  cards_reviewed?: number;
  cards_correct?: number;
  quiz_score?: number;
  quiz_total_questions?: number;
  notes_created?: number;
  notes_reviewed?: number;
}

// Define study routes where sessions should be active
export const STUDY_ROUTES = [
  '/flashcards',
  '/notes', 
  '/quiz',
  '/quizzes'
];
