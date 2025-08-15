import { useCallback } from 'react';
import { googleAnalyticsService } from '@/services/analytics/GoogleAnalyticsService';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Enhanced analytics hook for tracking content creation activities
 */
export const useContentAnalytics = () => {
  const { user } = useAuth();

  // Track note creation
  const trackNoteCreated = useCallback((
    noteId: string,
    wordCount: number,
    subject?: string,
    aiEnriched: boolean = false
  ) => {
    googleAnalyticsService.trackEvent('note_created', {
      event_category: 'Content Creation',
      custom_parameter_1: noteId,
      word_count: wordCount,
      study_subject: subject,
      ai_generated: aiEnriched
    });

    // Track AI usage
    if (aiEnriched) {
      googleAnalyticsService.trackEvent('note_ai_enriched', {
        event_category: 'AI Usage',
        word_count: wordCount,
        study_subject: subject
      });
    }
  }, []);

  // Track study plan creation
  const trackStudyPlanCreated = useCallback((
    planId: string,
    duration: number, // in weeks
    subject: string,
    goalType: string,
    aiGenerated: boolean = false
  ) => {
    googleAnalyticsService.trackEvent('study_plan_created', {
      event_category: 'Content Creation',
      custom_parameter_1: planId,
      session_duration: duration * 7 * 24 * 60, // Convert weeks to minutes for consistency
      study_subject: subject,
      goal_type: goalType as any,
      ai_generated: aiGenerated
    });
  }, []);

  // Track AI feature usage
  const trackAiFeatureUsed = useCallback((
    featureType: 'flashcard_generation' | 'quiz_generation' | 'note_enrichment' | 'study_plan' | 'question_answering',
    inputType: 'text' | 'image' | 'document',
    outputQuality?: 'high' | 'medium' | 'low',
    processingTime?: number
  ) => {
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'AI Usage',
      event_label: featureType,
      custom_parameter_1: inputType,
      custom_parameter_2: outputQuality || 'unknown',
      session_duration: processingTime
    });
  }, []);

  // Track feature discovery and onboarding
  const trackFeatureDiscovered = useCallback((
    featureName: string,
    discoveryMethod: 'tutorial' | 'exploration' | 'recommendation' | 'search',
    userTier?: 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN'
  ) => {
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'User Engagement',
      event_label: featureName,
      custom_parameter_1: discoveryMethod,
      user_tier: userTier
    });
  }, []);

  // Track onboarding step completion
  const trackOnboardingStep = useCallback((
    stepName: string,
    stepNumber: number,
    totalSteps: number,
    timeSpent?: number
  ) => {
    googleAnalyticsService.trackEvent('onboarding_step_completed', {
      event_category: 'Onboarding',
      event_label: stepName,
      custom_parameter_1: `step_${stepNumber}_of_${totalSteps}`,
      session_duration: timeSpent,
      achievement_percentage: Math.round((stepNumber / totalSteps) * 100)
    });
  }, []);

  // Track premium feature attempts (for conversion tracking)
  const trackPremiumFeatureAttempted = useCallback((
    featureName: string,
    userTier: 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN',
    requiredTier: 'GRADUATE' | 'MASTER' | 'DEAN'
  ) => {
    googleAnalyticsService.trackEvent('premium_feature_attempted', {
      event_category: 'Conversion',
      event_label: featureName,
      user_tier: userTier,
      custom_parameter_1: requiredTier,
      value: 1
    });
  }, []);

  // Track document/file uploads
  const trackFileUploaded = useCallback((
    fileType: 'pdf' | 'image' | 'text' | 'docx',
    fileSizeKB: number,
    processingSuccess: boolean,
    outputType?: 'flashcards' | 'notes' | 'quiz'
  ) => {
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'File Processing',
      event_label: `file_upload_${fileType}`,
      value: fileSizeKB,
      custom_parameter_1: processingSuccess ? 'success' : 'failed',
      custom_parameter_2: outputType || 'unknown'
    });
  }, []);

  // Track export/share actions
  const trackContentExported = useCallback((
    contentType: 'flashcards' | 'notes' | 'quiz_results' | 'study_plan',
    exportFormat: 'pdf' | 'csv' | 'json' | 'share_link',
    itemCount?: number
  ) => {
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'Content Export',
      event_label: `export_${contentType}`,
      custom_parameter_1: exportFormat,
      value: itemCount || 1
    });
  }, []);

  // Track search usage
  const trackSearchUsed = useCallback((
    searchType: 'flashcards' | 'notes' | 'global',
    query: string,
    resultCount: number,
    resultClicked?: boolean
  ) => {
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'Search',
      event_label: searchType,
      custom_parameter_1: query.substring(0, 50), // Truncate for privacy
      value: resultCount,
      custom_parameter_2: resultClicked ? 'clicked' : 'no_click'
    });
  }, []);

  return {
    trackNoteCreated,
    trackStudyPlanCreated,
    trackAiFeatureUsed,
    trackFeatureDiscovered,
    trackOnboardingStep,
    trackPremiumFeatureAttempted,
    trackFileUploaded,
    trackContentExported,
    trackSearchUsed
  };
};