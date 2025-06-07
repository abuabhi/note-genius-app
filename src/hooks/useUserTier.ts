
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export enum UserTier {
  SCHOLAR = "SCHOLAR",
  GRADUATE = "GRADUATE",
  MASTER = "MASTER",
  DEAN = "DEAN"
}

// Database tier limits interface
export interface TierLimits {
  max_notes: number;
  max_flashcard_sets: number;
  max_storage_mb: number;
  note_enrichment_limit_per_month: number | null;
  max_cards_per_set: number;
  max_ai_flashcard_generations_per_month: number;
  max_collaborations: number;
  ai_features_enabled: boolean;
  ai_flashcard_generation: boolean;
  note_enrichment_enabled: boolean;
  ocr_enabled: boolean;
  collaboration_enabled: boolean;
  priority_support: boolean;
  chat_enabled: boolean;
}

// Legacy interface for backward compatibility
export const tierLimits = {
  [UserTier.SCHOLAR]: {
    notes: 10,
    flashcardSets: 5,
    cardsPerSet: 20,
    aiNotesEnrichment: 10,
    aiFlashcardGeneration: 10,
    storageSize: 100,
    collaborations: 1
  },
  [UserTier.GRADUATE]: {
    notes: 100,
    flashcardSets: 25,
    cardsPerSet: 100,
    aiNotesEnrichment: 50,
    aiFlashcardGeneration: 50,
    storageSize: 500,
    collaborations: 5
  },
  [UserTier.MASTER]: {
    notes: 250,
    flashcardSets: 50,
    cardsPerSet: 100,
    aiNotesEnrichment: 200,
    aiFlashcardGeneration: 200,
    storageSize: 2048,
    collaborations: 15
  },
  [UserTier.DEAN]: {
    notes: -1,
    flashcardSets: -1,
    cardsPerSet: -1,
    aiNotesEnrichment: -1,
    aiFlashcardGeneration: -1,
    storageSize: 10240,
    collaborations: -1
  }
};

export const useUserTier = () => {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<UserTier>(UserTier.SCHOLAR);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user tier from profile
  useEffect(() => {
    const fetchUserTier = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_tier")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setUserTier(data.user_tier as UserTier || UserTier.SCHOLAR);
      } catch (error) {
        console.error("Error fetching user tier:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTier();
  }, [user]);

  // Fetch tier limits from database
  const { data: databaseTierLimits, isLoading: tierLimitsLoading } = useQuery({
    queryKey: ['tierLimits', userTier],
    queryFn: async (): Promise<TierLimits | null> => {
      const { data, error } = await supabase
        .from('tier_limits')
        .select('*')
        .eq('tier', userTier)
        .single();
      
      if (error) {
        console.error('Error fetching tier limits:', error);
        return null;
      }
      
      return data as TierLimits;
    },
    enabled: !!userTier && !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if user is on a premium tier
  const isUserPremium = userTier !== UserTier.SCHOLAR;

  return { 
    userTier, 
    tierLimits: databaseTierLimits, // New database-driven limits
    legacyTierLimits: tierLimits, // Keep legacy for backward compatibility
    isLoading: isLoading || tierLimitsLoading, 
    isUserPremium 
  };
};
