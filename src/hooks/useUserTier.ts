
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

// Export the enum for use in other files
export enum UserTier {
  SCHOLAR = "SCHOLAR",
  GRADUATE = "GRADUATE",
  MASTER = "MASTER",
  DEAN = "DEAN"
}

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
          .from('profiles')
          .select('user_tier')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && data.user_tier) {
          setUserTier(data.user_tier as UserTier);
        }
      } catch (error) {
        console.error('Error fetching user tier:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTier();
  }, [user]);

  // Check if user is premium (GRADUATE or higher)
  const isUserPremium = userTier !== UserTier.SCHOLAR;

  return { userTier, isLoading, isUserPremium };
};
