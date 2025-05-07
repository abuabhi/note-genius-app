
import { UserTier } from "@/hooks/useRequireAuth";

// Define which features are available to which user tiers
export const tierFeatures = {
  [UserTier.SCHOLAR]: {
    // Basic features available to all users
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
  },
  [UserTier.MASTER]: {
    // Master tier has all Scholar features plus these
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
    aiFlashcardGeneration: true,
    explanationsAndHints: true,
    exportImport: true,
    calendarIntegration: false,
  },
  [UserTier.DEAN]: {
    // Dean tier has all features
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
  },
};

// Helper function to check if a feature is available for a user tier
export const hasFeature = (tier: UserTier | undefined, feature: string): boolean => {
  if (!tier) return false;
  return tierFeatures[tier]?.[feature] || false;
};

// Premium feature checking
export const isPremiumTier = (tier: UserTier | undefined): boolean => {
  return tier === UserTier.MASTER || tier === UserTier.DEAN;
};

export const isCollaborationEnabled = (tier: UserTier | undefined): boolean => {
  return tier === UserTier.DEAN;
};
