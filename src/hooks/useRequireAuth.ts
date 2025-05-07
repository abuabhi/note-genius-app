
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserTier = 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN';

interface UserProfile {
  id: string;
  username: string | null;
  user_tier: UserTier;
  avatar_url: string | null;
  created_at: string | null;
}

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth state to be determined
      if (authLoading) return;
      
      if (!user) {
        navigate(redirectTo);
      } else {
        // Fetch user profile
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          setUserProfile(data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [user, authLoading, navigate, redirectTo]);

  return { user, userProfile, loading: authLoading || loading };
};
