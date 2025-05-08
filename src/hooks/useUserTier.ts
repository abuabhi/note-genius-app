
import { useRequireAuth, UserTier } from '@/hooks/useRequireAuth';

export const useUserTier = () => {
  const { userProfile } = useRequireAuth();
  
  const isUserPremium = userProfile?.user_tier === UserTier.DEAN || 
                        userProfile?.user_tier === UserTier.MASTER;
  
  return {
    isUserPremium,
    userTier: userProfile?.user_tier
  };
};
