
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isPremiumTier } from "@/utils/premiumFeatures";
import { UserTier, TierLimits } from "@/hooks/useRequireAuth";

export const useUserTier = () => {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["userTier", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("user_tier")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Define tier limits based on user tier
  const getTierLimits = (tier?: UserTier): TierLimits | null => {
    if (!tier) return null;
    
    switch(tier) {
      case UserTier.DEAN:
        return {
          max_notes: Infinity,
          max_storage_mb: 10000,
          max_flashcards: Infinity,
          ocr_enabled: true,
          ai_features_enabled: true,
          collaboration_enabled: true,
          priority_support: true,
          chat_enabled: true
        };
      case UserTier.MASTER:
        return {
          max_notes: 1000,
          max_storage_mb: 5000,
          max_flashcards: 5000,
          ocr_enabled: true,
          ai_features_enabled: true,
          collaboration_enabled: true,
          priority_support: true,
          chat_enabled: true
        };
      case UserTier.GRADUATE:
        return {
          max_notes: 500,
          max_storage_mb: 1000,
          max_flashcards: 1000,
          ocr_enabled: true,
          ai_features_enabled: false,
          collaboration_enabled: true,
          priority_support: false,
          chat_enabled: true
        };
      case UserTier.SCHOLAR:
      default:
        return {
          max_notes: 100,
          max_storage_mb: 250,
          max_flashcards: 250,
          ocr_enabled: false,
          ai_features_enabled: false,
          collaboration_enabled: false,
          priority_support: false,
          chat_enabled: false
        };
    }
  };

  return {
    userTier: data?.user_tier as UserTier | undefined,
    isLoading,
    error,
    isUserPremium: data ? isPremiumTier(data.user_tier as UserTier) : false,
    tierLimits: getTierLimits(data?.user_tier as UserTier)
  };
};
