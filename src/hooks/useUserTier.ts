
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isPremiumTier } from "@/utils/premiumFeatures";

type UserTier = 'SCHOLAR' | 'RESEARCHER' | 'DEAN' | 'ADMIN';

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

  return {
    userTier: data?.user_tier as UserTier | undefined,
    isLoading,
    error,
    isUserPremium: data ? isPremiumTier(data.user_tier as UserTier) : false
  };
};
