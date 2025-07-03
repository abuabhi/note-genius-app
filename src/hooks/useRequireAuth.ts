
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Export the UserTier enum that other files depend on
export enum UserTier {
  SCHOLAR = "SCHOLAR",
  GRADUATE = "GRADUATE", 
  MASTER = "MASTER",
  DEAN = "DEAN"
}

// Export TierLimits interface that other files depend on
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

// Export UserProfile interface that other files depend on
export interface UserProfile {
  id: string;
  username?: string;
  user_tier: UserTier;
  created_at: string;
  onboarding_completed?: boolean;
  avatar_url?: string;
  is_influencer?: boolean;
}

interface UseRequireAuthReturn {
  user: User | null;
  userProfile: UserProfile | null;
  tierLimits: TierLimits | null;
  loading: boolean;
}

export const useRequireAuth = (): UseRequireAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('🔐 [USE REQUIRE AUTH] Hook starting');

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        console.log('🔐 [USE REQUIRE AUTH] Getting current session...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('🔐 [USE REQUIRE AUTH] Session error:', sessionError);
          if (mounted) {
            setLoading(false);
            navigate('/login');
          }
          return;
        }

        if (!session?.user) {
          console.log('🔐 [USE REQUIRE AUTH] No session found, redirecting to login');
          if (mounted) {
            setLoading(false);
            navigate('/login');
          }
          return;
        }

        console.log('🔐 [USE REQUIRE AUTH] Session found:', {
          userId: session.user.id,
          email: session.user.email
        });

        if (mounted) {
          setUser(session.user);
          
          // Try to get user profile
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (mounted && profile) {
              setUserProfile({
                id: profile.id,
                username: profile.username,
                user_tier: profile.user_tier as UserTier || UserTier.SCHOLAR,
                created_at: profile.created_at,
                onboarding_completed: profile.onboarding_completed,
                avatar_url: profile.avatar_url,
                is_influencer: profile.is_influencer
              });

              // Get tier limits
              try {
                const { data: limits } = await supabase
                  .from('tier_limits')
                  .select('*')
                  .eq('tier', profile.user_tier || UserTier.SCHOLAR)
                  .single();

                if (mounted && limits) {
                  setTierLimits(limits as TierLimits);
                }
              } catch (limitsError) {
                console.log('🔐 [USE REQUIRE AUTH] No tier limits found (this is ok):', limitsError);
              }
            }
          } catch (profileError) {
            console.log('🔐 [USE REQUIRE AUTH] No profile found (this is ok):', profileError);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 [USE REQUIRE AUTH] Error in getUser:', error);
        if (mounted) {
          setLoading(false);
          navigate('/login');
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [USE REQUIRE AUTH] Auth state changed:', event, { userId: session?.user?.id });
        
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            setUser(null);
            setUserProfile(null);
            setTierLimits(null);
            setLoading(false);
            navigate('/login');
          }
        } else if (event === 'SIGNED_IN' && session) {
          if (mounted) {
            setUser(session.user);
            setLoading(false);
          }
        }
      }
    );

    getUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    user,
    userProfile,
    tierLimits,
    loading
  };
};
