
import { UserTier } from "@/hooks/useRequireAuth";

// Define which features are available to which user tiers - all features now permanently available
export const tierFeatures = {
  [UserTier.SCHOLAR]: {
    // All features available to all users now
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
    basicQuizzes: true,
    basicProgress: true,
    explanationsAndHints: true,
    exportImport: true,
    quizExplanations: true,
    aiFlashcardGeneration: true,
    calendarIntegration: true,
    advancedAnalytics: true,
    smartScheduling: true,
    collaborativeFeatures: true,
    unlimitedSets: true,
    smartQuizGeneration: true,
    personalizedLearningPath: true,
    customQuizTemplates: true,
  },
  [UserTier.GRADUATE]: {
    // All features available
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
    explanationsAndHints: true,
    exportImport: true,
    basicQuizzes: true,
    basicProgress: true,
    quizExplanations: true,
    aiFlashcardGeneration: true,
    calendarIntegration: true,
    advancedAnalytics: true,
    smartScheduling: true,
    collaborativeFeatures: true,
    unlimitedSets: true,
    smartQuizGeneration: true,
    personalizedLearningPath: true,
    customQuizTemplates: true,
  },
  [UserTier.MASTER]: {
    // All features available
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
    aiFlashcardGeneration: true,
    explanationsAndHints: true,
    exportImport: true,
    calendarIntegration: true,
    basicQuizzes: true,
    basicProgress: true,
    quizExplanations: true,
    advancedAnalytics: true,
    smartScheduling: true,
    collaborativeFeatures: true,
    unlimitedSets: true,
    smartQuizGeneration: true,
    personalizedLearningPath: true,
    customQuizTemplates: true,
  },
  [UserTier.DEAN]: {
    // All features available
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
    aiFlashcardGeneration: true,
    explanationsAndHints: true,
    exportImport: true,
    calendarIntegration: true,
    smartScheduling: true,
    collaborativeFeatures: true,
    unlimitedSets: true,
    basicQuizzes: true,
    basicProgress: true,
    quizExplanations: true,
    advancedAnalytics: true,
    smartQuizGeneration: true,
    personalizedLearningPath: true,
    customQuizTemplates: true,
  },
};

// Helper function to check if a feature is available for a user tier - all features now return true
export const hasFeature = (tier: UserTier | undefined, feature: string): boolean => {
  return true; // All features are now permanently available
};

// Premium feature checking - all users now have premium features
export const isPremiumTier = (tier: UserTier | undefined): boolean => {
  return true; // All tiers are now considered premium
};

export const isCollaborationEnabled = (tier: UserTier | undefined): boolean => {
  return true; // Collaboration enabled for all
};
