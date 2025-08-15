import { useCallback } from 'react';
import { googleAnalyticsService } from '@/services/analytics/GoogleAnalyticsService';
import { userSessionTracker } from '@/services/analytics/UserSessionTracker';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Enhanced analytics hook for tracking quiz activities
 */
export const useQuizAnalytics = () => {
  const { user } = useAuth();

  // Track quiz attempt start
  const trackQuizAttemptStart = useCallback((
    quizId: string, 
    quizType: 'flashcard_quiz' | 'ai_generated_quiz',
    questionCount: number,
    subject?: string,
    flashcardSetId?: string
  ) => {
    googleAnalyticsService.trackQuizInteraction('quiz_attempt_start', {
      quiz_id: quizId,
      quiz_type: quizType,
      total_questions: questionCount,
      study_subject: subject,
      flashcard_set_id: flashcardSetId
    });

    userSessionTracker.trackStudySessionStart('quiz', {
      quizId,
      quizType,
      questionCount,
      subject,
      flashcardSetId
    });
  }, []);

  // Track individual question answer
  const trackQuestionAnswered = useCallback((
    quizId: string,
    questionNumber: number,
    isCorrect: boolean,
    timeSpent: number,
    questionType?: string
  ) => {
    googleAnalyticsService.trackQuizInteraction('quiz_question_answered', {
      quiz_id: quizId,
      value: isCorrect ? 1 : 0,
      session_duration: timeSpent,
      custom_parameter_1: questionNumber.toString(),
      custom_parameter_2: questionType || 'unknown'
    });
  }, []);

  // Track quiz attempt completion
  const trackQuizAttemptComplete = useCallback((
    quizId: string,
    quizData: {
      quizType: 'flashcard_quiz' | 'ai_generated_quiz';
      totalQuestions: number;
      correctAnswers: number;
      sessionDuration: number;
      subject?: string;
      flashcardSetId?: string;
      passed?: boolean;
    }
  ) => {
    const score = Math.round((quizData.correctAnswers / quizData.totalQuestions) * 100);
    const passRate = quizData.totalQuestions > 0 ? score : 0;

    googleAnalyticsService.trackQuizInteraction('quiz_attempt_complete', {
      quiz_id: quizId,
      quiz_type: quizData.quizType,
      score: quizData.correctAnswers,
      total_questions: quizData.totalQuestions,
      pass_rate: passRate,
      session_duration: quizData.sessionDuration,
      study_subject: quizData.subject,
      flashcard_set_id: quizData.flashcardSetId
    });

    userSessionTracker.trackStudySessionComplete('quiz', quizData.sessionDuration, {
      quizId,
      score: quizData.correctAnswers,
      passRate,
      quizType: quizData.quizType,
      totalQuestions: quizData.totalQuestions
    });

    // Track perfect score achievement
    if (score === 100) {
      googleAnalyticsService.trackQuizInteraction('quiz_perfect_score', {
        quiz_id: quizId,
        quiz_type: quizData.quizType,
        total_questions: quizData.totalQuestions,
        session_duration: quizData.sessionDuration
      });

      // Track as achievement
      googleAnalyticsService.trackEvent('accuracy_milestone', {
        event_category: 'Achievement',
        accuracy_rate: 100,
        quiz_id: quizId
      });
    }

    // Track pass/fail for learning analytics
    if (quizData.passed !== undefined) {
      googleAnalyticsService.trackEvent(quizData.passed ? 'goal_achieved' : 'quiz_attempt_complete', {
        event_category: quizData.passed ? 'Achievement' : 'Study',
        quiz_id: quizId,
        pass_rate: passRate,
        value: quizData.passed ? 1 : 0
      });
    }
  }, []);

  // Track quiz abandonment
  const trackQuizAttemptAbandon = useCallback((
    quizId: string,
    questionsCompleted: number,
    totalQuestions: number,
    timeSpent: number
  ) => {
    const completionRate = totalQuestions > 0 ? Math.round((questionsCompleted / totalQuestions) * 100) : 0;

    googleAnalyticsService.trackQuizInteraction('quiz_attempt_abandon', {
      quiz_id: quizId,
      score: questionsCompleted,
      total_questions: totalQuestions,
      pass_rate: completionRate,
      session_duration: timeSpent
    });
  }, []);

  // Track AI quiz generation
  const trackAiQuizGenerated = useCallback((
    quizId: string,
    questionCount: number,
    subject: string,
    sourceType: 'notes' | 'flashcards' | 'manual',
    sourceId?: string
  ) => {
    googleAnalyticsService.trackEvent('quiz_attempt_start', {
      event_category: 'Content Creation',
      quiz_id: quizId,
      quiz_type: 'ai_generated_quiz',
      total_questions: questionCount,
      study_subject: subject,
      ai_generated: true,
      custom_parameter_1: sourceType,
      custom_parameter_2: sourceId
    });

    // Track AI feature usage
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'AI Usage',
      event_label: 'ai_quiz_generation',
      study_subject: subject,
      value: questionCount
    });
  }, []);

  // Track quiz retake
  const trackQuizRetake = useCallback((
    quizId: string,
    attemptNumber: number,
    previousScore: number,
    improvementGoal?: number
  ) => {
    googleAnalyticsService.trackEvent('quiz_attempt_start', {
      event_category: 'Study',
      quiz_id: quizId,
      custom_parameter_1: `attempt_${attemptNumber}`,
      custom_parameter_2: previousScore.toString(),
      value: improvementGoal || 0
    });
  }, []);

  // Track study insights from quiz results
  const trackQuizInsights = useCallback((
    quizId: string,
    insights: {
      weakAreas: string[];
      strongAreas: string[];
      recommendedStudyTime: number;
      suggestedTopics: string[];
    }
  ) => {
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'Learning Analytics',
      event_label: 'quiz_insights_generated',
      quiz_id: quizId,
      custom_parameter_1: insights.weakAreas.join(','),
      custom_parameter_2: insights.strongAreas.join(','),
      value: insights.recommendedStudyTime
    });
  }, []);

  return {
    trackQuizAttemptStart,
    trackQuestionAnswered,
    trackQuizAttemptComplete,
    trackQuizAttemptAbandon,
    trackAiQuizGenerated,
    trackQuizRetake,
    trackQuizInsights
  };
};