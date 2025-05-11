
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

// Define available user tiers as enum
export enum UserTier {
  SCHOLAR = 'SCHOLAR',
  GRADUATE = 'GRADUATE',
  MASTER = 'MASTER',
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
  note_enrichment_enabled: boolean;
  note_enrichment_limit_per_month?: number;
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
  const location = useLocation();
  
  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  useEffect(() => {
    // Don't do anything while the auth is still loading
    if (authLoading) return;
    
    // Only redirect to login if the user is not authenticated AND we're not on a public route
    if (!user && !isPublicRoute) {
      navigate('/login');
      setLoading(false);
      return;
    }
    
    // If user is authenticated, fetch user data
    if (user) {
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

            // Transform the profileData to match the UserProfile interface
            const notificationPrefs = profileData.notification_preferences ? 
              (typeof profileData.notification_preferences === 'string' 
                ? JSON.parse(profileData.notification_preferences)
                : profileData.notification_preferences) 
              : { email: false, in_app: true, whatsapp: false };

            const typedProfile: UserProfile = {
              id: profileData.id,
              username: profileData.username || '',
              avatar_url: profileData.avatar_url,
              user_tier: profileData.user_tier as UserTier,
              do_not_disturb: profileData.do_not_disturb || false,
              dnd_start_time: profileData.dnd_start_time,
              dnd_end_time: profileData.dnd_end_time,
              notification_preferences: {
                email: notificationPrefs.email === true,
                in_app: notificationPrefs.in_app !== false,
                whatsapp: notificationPrefs.whatsapp === true
              },
              created_at: profileData.created_at || '',
              updated_at: profileData.updated_at || ''
            };

            setUserProfile(typedProfile);
          }
        } catch (error) {
          console.error('Error in useRequireAuth:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      // If we're on a public route but not authenticated,
      // just set loading to false without redirecting
      setLoading(false);
    }
    
    // Store the current path as the last visited page
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem('lastVisitedPage', location.pathname);
    }
    
  }, [user, authLoading, navigate, location.pathname, isPublicRoute]);

  return { user, userProfile, loading: authLoading || loading, tierLimits };
};
