
import { useEffect, useCallback } from 'react';
import { useAdaptiveLearning } from './progress/adaptive';
import { useSessionAnalytics } from './useSessionAnalytics';
import { useAuth } from '@/contexts/auth';

interface LearningPathCreationData {
  activityType: string;
  subject?: string;
  resourceId?: string;
  performanceData?: {
    accuracy: number;
    timeSpent: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

export const useAdaptiveLearningIntegration = () => {
  const { user } = useAuth();
  const { adaptiveLearningInsights } = useAdaptiveLearning();
  const { sessions } = useSessionAnalytics();

  // Auto-create learning paths when user starts studying
  const createLearningPathFromActivity = useCallback(async (data: LearningPathCreationData) => {
    if (!user) return;

    try {
      // Check if learning path already exists for this subject
      const existingPath = adaptiveLearningInsights.learningPaths.find(
        path => path.subject.toLowerCase() === data.subject?.toLowerCase()
      );

      if (existingPath) {
        console.log('Learning path already exists for subject:', data.subject);
        return existingPath;
      }

      // Create new learning path based on activity
      const newPath = {
        subject: data.subject || 'General Study',
        activityType: data.activityType,
        resourceId: data.resourceId,
        difficulty: data.performanceData?.difficulty || 'beginner',
        createdFromSession: true
      };

      console.log('Would create new learning path:', newPath);
      // In a real implementation, this would call an API to create the path
      
      return newPath;
    } catch (error) {
      console.error('Failed to create learning path from activity:', error);
    }
  }, [user, adaptiveLearningInsights.learningPaths]);

  // Real-time adaptation based on performance
  const adaptToPerformance = useCallback((performanceData: {
    accuracy: number;
    sessionDuration: number;
    cardsReviewed: number;
    subject?: string;
  }) => {
    if (!user) return;

    // Analyze performance and suggest adaptations
    const adaptations = [];

    if (performanceData.accuracy < 0.6) {
      adaptations.push({
        type: 'difficulty_reduction',
        message: 'Consider reviewing easier concepts first',
        priority: 'high'
      });
    }

    if (performanceData.accuracy > 0.9) {
      adaptations.push({
        type: 'difficulty_increase',
        message: 'Ready for more challenging material',
        priority: 'medium'
      });
    }

    if (performanceData.sessionDuration > 3600) { // > 1 hour
      adaptations.push({
        type: 'break_suggestion',
        message: 'Consider taking a break to maintain focus',
        priority: 'medium'
      });
    }

    console.log('Performance adaptations:', adaptations);
    return adaptations;
  }, [user]);

  // Track session quality and update learning paths
  const updateLearningPathProgress = useCallback((sessionData: {
    sessionId: string;
    subject?: string;
    accuracy: number;
    timeSpent: number;
    completed: boolean;
  }) => {
    if (!user) return;

    // Find relevant learning path
    const relevantPath = adaptiveLearningInsights.learningPaths.find(
      path => path.subject.toLowerCase() === sessionData.subject?.toLowerCase()
    );

    if (relevantPath) {
      // Update path progress based on session performance
      const progressUpdate = {
        pathId: relevantPath.id,
        sessionPerformance: {
          accuracy: sessionData.accuracy,
          timeSpent: sessionData.timeSpent,
          completed: sessionData.completed
        },
        nextStepRecommendation: sessionData.accuracy > 0.8 ? 'advance' : 'review'
      };

      console.log('Learning path progress update:', progressUpdate);
      // In a real implementation, this would update the learning path
    }
  }, [user, adaptiveLearningInsights.learningPaths]);

  // Monitor active sessions for automatic adaptations
  useEffect(() => {
    const activeSessions = sessions.filter(session => session.is_active);
    
    activeSessions.forEach(session => {
      // Auto-create learning paths for new subjects
      if (session.subject && session.activity_type) {
        createLearningPathFromActivity({
          activityType: session.activity_type,
          subject: session.subject,
          resourceId: session.flashcard_set_id || undefined
        });
      }
    });
  }, [sessions, createLearningPathFromActivity]);

  return {
    createLearningPathFromActivity,
    adaptToPerformance,
    updateLearningPathProgress,
    activeLearningPaths: adaptiveLearningInsights.learningPaths.filter(path => 
      path.currentStep < path.totalSteps
    )
  };
};
