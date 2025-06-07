
import { useState } from "react";
import { useAuth } from "./auth/useAuth";

export function usePremiumFeatures() {
  const { user } = useAuth();
  
  // All features are now permanently enabled - no more feature flag checking
  const isPremium = true; // Enable all premium features
  
  // All features are now enabled
  const aiFlashcardGenerationEnabled = true;
  const enhancedNotesEnabled = true;
  const unlimitedFlashcardsEnabled = true;
  
  return {
    isPremium,
    aiFlashcardGenerationEnabled,
    enhancedNotesEnabled,
    unlimitedFlashcardsEnabled
  };
}
