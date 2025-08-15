import { useCallback } from 'react';
import { googleAnalyticsService } from '@/services/analytics/GoogleAnalyticsService';
import { userSessionTracker } from '@/services/analytics/UserSessionTracker';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Enhanced analytics hook for tracking flashcard study activities
 */
export const useFlashcardAnalytics = () => {
  const { user } = useAuth();

  // Track flashcard study session start
  const trackFlashcardStudyStart = useCallback((flashcardSetId: string, setName: string, cardCount: number, studyMode: 'study' | 'review' | 'quick_review' = 'study') => {
    googleAnalyticsService.trackFlashcardInteraction('flashcard_study_start', {
      flashcard_set_id: flashcardSetId,
      cards_reviewed: cardCount,
      study_mode: studyMode,
      event_label: setName
    });

    userSessionTracker.trackStudySessionStart('flashcard', {
      flashcardSetId,
      setName,
      cardCount,
      studyMode
    });
  }, []);

  // Track individual card review
  const trackCardReview = useCallback((flashcardId: string, difficulty: 'easy' | 'medium' | 'hard' | 'again', timeSpent: number) => {
    googleAnalyticsService.trackFlashcardInteraction('flashcard_card_review', {
      difficulty_level: difficulty,
      session_duration: timeSpent,
      custom_parameter_1: flashcardId
    });
  }, []);

  // Track card answer (correct/incorrect)
  const trackCardAnswer = useCallback((flashcardId: string, isCorrect: boolean, timeSpent: number) => {
    const eventName = isCorrect ? 'flashcard_card_correct' : 'flashcard_card_incorrect';
    
    googleAnalyticsService.trackFlashcardInteraction(eventName, {
      session_duration: timeSpent,
      custom_parameter_1: flashcardId,
      value: isCorrect ? 1 : 0
    });
  }, []);

  // Track difficulty selection (SM-2 algorithm feedback)
  const trackDifficultySelection = useCallback((flashcardId: string, difficulty: 'easy' | 'medium' | 'hard' | 'again', newInterval: number) => {
    googleAnalyticsService.trackFlashcardInteraction('flashcard_difficulty_selected', {
      difficulty_level: difficulty,
      value: newInterval, // Next review interval
      custom_parameter_1: flashcardId
    });
  }, []);

  // Track flashcard study session completion
  const trackFlashcardStudyComplete = useCallback((
    flashcardSetId: string, 
    sessionData: {
      cardsReviewed: number;
      cardsCorrect: number;
      sessionDuration: number;
      studyMode: 'study' | 'review' | 'quick_review';
      setName: string;
    }
  ) => {
    const accuracyRate = sessionData.cardsReviewed > 0 
      ? Math.round((sessionData.cardsCorrect / sessionData.cardsReviewed) * 100) 
      : 0;

    googleAnalyticsService.trackFlashcardInteraction('flashcard_study_complete', {
      flashcard_set_id: flashcardSetId,
      cards_reviewed: sessionData.cardsReviewed,
      cards_correct: sessionData.cardsCorrect,
      accuracy_rate: accuracyRate,
      session_duration: sessionData.sessionDuration,
      study_mode: sessionData.studyMode,
      event_label: sessionData.setName
    });

    userSessionTracker.trackStudySessionComplete('flashcard', sessionData.sessionDuration, {
      flashcardSetId,
      cardsReviewed: sessionData.cardsReviewed,
      accuracyRate,
      studyMode: sessionData.studyMode
    });

    // Track accuracy milestones
    if (accuracyRate >= 90) {
      googleAnalyticsService.trackEvent('accuracy_milestone', {
        event_category: 'Achievement',
        accuracy_rate: accuracyRate,
        flashcard_set_id: flashcardSetId
      });
    }
  }, []);

  // Track when a flashcard set is mastered
  const trackFlashcardSetMastered = useCallback((flashcardSetId: string, setName: string, totalCards: number, sessionsToMaster: number) => {
    googleAnalyticsService.trackFlashcardInteraction('flashcard_set_mastered', {
      flashcard_set_id: flashcardSetId,
      cards_reviewed: totalCards,
      value: sessionsToMaster,
      event_label: setName
    });

    // Track as achievement
    googleAnalyticsService.trackEvent('cards_mastered_milestone', {
      event_category: 'Achievement',
      flashcard_set_id: flashcardSetId,
      value: totalCards
    });
  }, []);

  // Track flashcard creation events
  const trackFlashcardCreated = useCallback((flashcardSetId: string, isAiGenerated: boolean = false, subject?: string) => {
    googleAnalyticsService.trackEvent('flashcard_created', {
      event_category: 'Content Creation',
      flashcard_set_id: flashcardSetId,
      ai_generated: isAiGenerated,
      study_subject: subject
    });
  }, []);

  // Track flashcard set creation
  const trackFlashcardSetCreated = useCallback((flashcardSetId: string, cardCount: number, isAiGenerated: boolean = false, subject?: string) => {
    googleAnalyticsService.trackEvent('flashcard_set_created', {
      event_category: 'Content Creation',
      flashcard_set_id: flashcardSetId,
      cards_reviewed: cardCount, // Using this field to represent total cards in set
      ai_generated: isAiGenerated,
      study_subject: subject
    });

    // Track conversion if this is their first set
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'User Engagement',
      event_label: 'flashcard_creation',
      value: 1
    });
  }, []);

  return {
    trackFlashcardStudyStart,
    trackCardReview,
    trackCardAnswer,
    trackDifficultySelection,
    trackFlashcardStudyComplete,
    trackFlashcardSetMastered,
    trackFlashcardCreated,
    trackFlashcardSetCreated
  };
};