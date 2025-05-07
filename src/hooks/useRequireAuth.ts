
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Convert UserTier from a type to an enum so it can be used as a value
export enum UserTier {
  SCHOLAR = 'SCHOLAR',
  GRADUATE = 'GRADUATE',
  MASTER = 'MASTER',
  PROFESSOR = 'PROFESSOR',
  DEAN = 'DEAN'
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  user_tier: UserTier;
  created_at: string | null;
  updated_at: string | null;
}

export interface TierLimits {
  tier: UserTier;
  max_notes: number;
  max_storage_mb: number;
  ocr_enabled: boolean;
  ai_features_enabled: boolean;
  collaboration_enabled: boolean;
  priority_support: boolean;
}

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading && !user) {
        navigate(redirectTo);
      } else if (!loading && user) {
        setIsAuthorized(true);
        
        const fetchProfileAndTierLimits = async () => {
          setProfileLoading(true);
          try {
            // Check if user is the specific email to give them Dean role
            if (user.email === 'abhinav.paul.sharma@gmail.com') {
              // Update the user to Dean tier
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ user_tier: UserTier.DEAN })
                .eq('id', user.id);
                
              if (updateError) {
                throw updateError;
              }
            }
            
            // Fetch user profile (will reflect the updated tier)
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (profileError) {
              throw profileError;
            }

            setProfile(profileData as UserProfile);
            
            // Fetch tier limits
            if (profileData?.user_tier) {
              const { data: tierData, error: tierError } = await supabase
                .from('tier_limits')
                .select('*')
                .eq('tier', profileData.user_tier)
                .single();
                
              if (tierError) {
                throw tierError;
              }
              
              setTierLimits(tierData as TierLimits);
            }
          } catch (error) {
            console.error('Error fetching user profile or tier limits:', error);
          } finally {
            setProfileLoading(false);
          }
        };
        
        fetchProfileAndTierLimits();
      }
    };
    
    checkAuth();
  }, [user, loading, navigate, redirectTo]);

  return { isAuthorized, loading: loading || profileLoading, user, profile, tierLimits };
};
