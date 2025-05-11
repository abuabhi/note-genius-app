
import { useState } from "react";
import { useAuth } from "./auth/useAuth";

export function usePremiumFeatures() {
  const { userProfile } = useAuth();
  
  // Check if the user has premium features based on their tier
  const isPremium = userProfile?.user_tier === "PREMIUM" || userProfile?.user_tier === "ENTERPRISE";
  
  // Define which features are enabled
  const aiFlashcardGenerationEnabled = isPremium;
  const enhancedNotesEnabled = isPremium;
  const unlimitedFlashcardsEnabled = isPremium;
  
  return {
    isPremium,
    aiFlashcardGenerationEnabled,
    enhancedNotesEnabled,
    unlimitedFlashcardsEnabled
  };
}
