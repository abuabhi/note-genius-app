
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UseRequireAuthReturn {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
}

export const useRequireAuth = (): UseRequireAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
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
            
            if (mounted) {
              setUserProfile(profile);
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
    loading
  };
};
