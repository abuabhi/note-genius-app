
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define available user tiers as enum
export enum UserTier {
  SCHOLAR = 'SCHOLAR',
  TEACHER = 'TEACHER',
  DEAN = 'DEAN'
}

export type TierLimits = {
  max_notes: number;
  max_flashcard_sets: number;
  max_storage_mb: number;
  ai_features_enabled: boolean;
  ai_flashcard_generation: boolean;
  ocr_enabled: boolean;
  collaboration_enabled: boolean;
  chat_enabled: boolean;
  priority_support: boolean;
};

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  user_tier: UserTier;
  do_not_disturb: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
    whatsapp: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const useRequireAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Debug log for troubleshooting
  console.log('useRequireAuth hook running, auth state:', { user, authLoading, loading });

  useEffect(() => {
    // Don't do anything while the auth is still loading
    if (authLoading) return;
    
    console.log('Auth loading finished, user:', user);
    
    if (!user) {
      console.log('No user found, redirecting to /login');
      // We delay navigation to avoid issues with React state updates
      setTimeout(() => navigate('/login'), 10);
      setLoading(false);
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Fetch the user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw profileError;
        }

        // Fetch tier limits based on user's tier
        if (profileData) {
          const { data: tierData, error: tierError } = await supabase
            .from('tier_limits')
            .select('*')
            .eq('tier', profileData.user_tier)
            .single();

          if (tierError) {
            console.error('Error fetching tier limits:', tierError);
          } else {
            setTierLimits(tierData);
          }

          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error in useRequireAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading, navigate]);

  return { user, userProfile, loading: authLoading || loading, tierLimits };
};
