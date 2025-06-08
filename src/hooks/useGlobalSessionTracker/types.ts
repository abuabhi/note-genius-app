
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

// Define study routes where sessions should be active - be very specific
export const STUDY_ROUTES = [
  '/flashcards/study',
  '/flashcards/sets',
  '/notes/study',
  '/notes/editor',
  '/quiz/taking',
  '/quizzes/practice'
];

// Define non-study routes where sessions should NEVER be active
export const NON_STUDY_ROUTES = [
  '/dashboard',
  '/settings',
  '/profile',
  '/goals',
  '/todos',
  '/referrals',
  '/auth',
  '/progress',
  '/admin',
  '/'
];

// Helper function to check if current path is a study route
export const isStudyRoute = (pathname: string): boolean => {
  // First check if it's explicitly a non-study route
  if (NON_STUDY_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    console.log(`🚫 NON-STUDY ROUTE: ${pathname}`);
    return false;
  }
  
  // Check if it matches any study route patterns
  const isStudy = STUDY_ROUTES.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
  
  console.log(`${isStudy ? '📚' : '🚫'} Route check: ${pathname} -> ${isStudy ? 'STUDY' : 'NON-STUDY'}`);
  return isStudy;
};
