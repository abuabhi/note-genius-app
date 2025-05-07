
import { UserTier } from "@/hooks/useRequireAuth";

// Define which features are available to which user tiers
export const tierFeatures = {
  [UserTier.SCHOLAR]: {
    // Basic features available to all users
    basicFlashcards: true,
    studyTracking: true,
    notesTaking: true,
  },
  [UserTier.PROFESSOR]: {
    // Professor tier has all Scholar features plus these
    ...UserTier.SCHOLAR && tierFeatures[UserTier.SCHOLAR],
    aiFlashcardGeneration: true,
    explanationsAndHints: true,
    exportImport: true,
    calendarIntegration: false,
  },
  [UserTier.DEAN]: {
    // Dean tier has all features
    ...UserTier.PROFESSOR && tierFeatures[UserTier.PROFESSOR],
    smartScheduling: true,
    collaborativeFeatures: true,
    calendarIntegration: true,
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
  return tier === UserTier.PROFESSOR || tier === UserTier.DEAN;
};

export const isCollaborationEnabled = (tier: UserTier | undefined): boolean => {
  return tier === UserTier.DEAN;
};
