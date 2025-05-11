
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export enum UserTier {
  SCHOLAR = "SCHOLAR",
  GRADUATE = "GRADUATE",
  MASTER = "MASTER",
  DEAN = "DEAN"
}

// Define tier limits for each user tier
export const tierLimits = {
  [UserTier.SCHOLAR]: {
    notes: 50,
    flashcardSets: 5,
    cardsPerSet: 100,
    aiNotesEnrichment: 5,
    aiFlashcardGeneration: 3,
    storageSize: 100, // MB
    collaborations: 1
  },
  [UserTier.GRADUATE]: {
    notes: 100,
    flashcardSets: 15,
    cardsPerSet: 250,
    aiNotesEnrichment: 20,
    aiFlashcardGeneration: 10,
    storageSize: 500, // MB
    collaborations: 5
  },
  [UserTier.MASTER]: {
    notes: 250,
    flashcardSets: 30,
    cardsPerSet: 500,
    aiNotesEnrichment: 50,
    aiFlashcardGeneration: 25,
    storageSize: 2048, // MB
    collaborations: 15
  },
  [UserTier.DEAN]: {
    notes: -1, // Unlimited
    flashcardSets: -1, // Unlimited
    cardsPerSet: -1, // Unlimited
    aiNotesEnrichment: -1, // Unlimited
    aiFlashcardGeneration: -1, // Unlimited
    storageSize: 10240, // MB
    collaborations: -1 // Unlimited
  }
};

export const useUserTier = () => {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<UserTier>(UserTier.SCHOLAR);
  const [isLoading, setIsLoading] = useState(true);

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

  // Check if user is on a premium tier
  const isUserPremium = userTier !== UserTier.SCHOLAR;

  return { userTier, tierLimits, isLoading, isUserPremium };
};
