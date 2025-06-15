
import { useCallback } from 'react';
import { useUnifiedSessionTracker } from './useUnifiedSessionTracker';

/**
 * Simplified study activity tracker that uses the unified session system
 */
export const useStudyActivityTracker = () => {
  const { recordActivity, updateSessionActivity, isActive, startSession } = useUnifiedSessionTracker();

  const trackFlashcardActivity = useCallback((activityData: {
    cardsReviewed?: number;
    cardsCorrect?: number;
    setName?: string;
    subject?: string;
  }) => {
    recordActivity();
    updateSessionActivity({
      cards_reviewed: activityData.cardsReviewed,
      cards_correct: activityData.cardsCorrect
    });
  }, [recordActivity, updateSessionActivity]);

  const trackNoteActivity = useCallback((activityData: {
    notesReviewed?: number;
    noteName?: string;
    subject?: string;
  }) => {
    recordActivity();
    updateSessionActivity({
      notes_reviewed: activityData.notesReviewed
    });
  }, [recordActivity, updateSessionActivity]);

  const trackQuizActivity = useCallback((activityData: {
    quizScore?: number;
    totalQuestions?: number;
    quizName?: string;
    subject?: string;
  }) => {
    recordActivity();
    updateSessionActivity({
      quiz_score: activityData.quizScore,
      quiz_total_questions: activityData.totalQuestions
    });
  }, [recordActivity, updateSessionActivity]);

  const startStudySession = useCallback((
    type: 'flashcard_study' | 'note_review' | 'quiz_taking',
    title: string,
    subject?: string
  ) => {
    if (!isActive) {
      return startSession(type, title, subject);
    }
    return null;
  }, [isActive, startSession]);

  return {
    isSessionActive: isActive,
    trackFlashcardActivity,
    trackNoteActivity,
    trackQuizActivity,
    startStudySession,
    recordActivity
  };
};
