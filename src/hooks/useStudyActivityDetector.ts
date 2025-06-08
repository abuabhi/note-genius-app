
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

const STUDY_ROUTES = {
  '/flashcards': 'flashcard_study',
  '/notes': 'note_review',
  '/quiz': 'quiz_taking',
  '/quizzes': 'quiz_taking',
  '/study-sessions': 'general'
} as const;

export const useStudyActivityDetector = () => {
  const location = useLocation();
  const { isTracking, startSession, endSession } = useSession();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if we're on a study-related page
    const studyRoute = Object.keys(STUDY_ROUTES).find(route => 
      currentPath.startsWith(route)
    );

    if (studyRoute && !isTracking) {
      // Start session for study activity
      console.log('Auto-starting session for study activity on route:', currentPath);
      startSession();
    } else if (!studyRoute && isTracking) {
      // End session when leaving study pages
      console.log('Auto-ending session - left study area');
      endSession();
    }
  }, [location.pathname, isTracking, startSession, endSession]);

  return { isTracking };
};
