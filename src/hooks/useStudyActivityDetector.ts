
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

const STUDY_ROUTES = {
  '/flashcards': 'flashcard_study',
  '/notes': 'note_review',
  '/quiz': 'quiz_taking',
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
      const activityType = STUDY_ROUTES[studyRoute as keyof typeof STUDY_ROUTES];
      
      // Get subject/title from URL if available
      let title = `${activityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session`;
      let subject = 'General';

      // Extract more specific info from URL if possible
      if (currentPath.includes('/flashcards/')) {
        title = 'Flashcard Study Session';
        subject = 'Flashcards';
      } else if (currentPath.includes('/notes/')) {
        title = 'Note Review Session';
        subject = 'Notes';
      } else if (currentPath.includes('/quiz/')) {
        title = 'Quiz Session';
        subject = 'Quiz';
      }

      console.log('Auto-starting session for:', activityType, 'on route:', currentPath);
      startSession(activityType, title, subject);
    } else if (!studyRoute && isTracking) {
      // End session when leaving study pages
      console.log('Auto-ending session - left study area');
      endSession();
    }
  }, [location.pathname, isTracking, startSession, endSession]);

  return { isTracking };
};
