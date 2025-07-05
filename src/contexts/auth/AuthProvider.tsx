import React, { ReactNode, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { signOutAndCleanup } from '@/utils/authUtils';
import { useAuthRedirects } from '@/hooks/auth/useAuthRedirects';
import { ReferralSignupHandler } from '@/components/referrals/ReferralSignupHandler';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('🔐 [AUTH PROVIDER] State:', { 
    userId: user?.id, 
    loading, 
    onboardingCompleted, 
    onboardingLoading,
    currentPath: location.pathname 
  });
  
  // Check onboarding status when user changes
  const checkOnboardingStatus = async (userId: string) => {
    if (!userId) {
      setOnboardingCompleted(null);
      setOnboardingLoading(false);
      return;
    }

    try {
      console.log('🔐 [AUTH PROVIDER] Checking onboarding status for:', userId);
      setOnboardingLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, first_name, user_tier')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const completed = data?.onboarding_completed ?? false;
      console.log('🔐 [AUTH PROVIDER] Onboarding status result:', completed);
      setOnboardingCompleted(completed);
    } catch (error) {
      console.error('🔐 [AUTH PROVIDER] Error checking onboarding status:', error);
      setOnboardingCompleted(false);
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Refresh onboarding status function
  const refreshOnboardingStatus = async () => {
    if (user?.id) {
      await checkOnboardingStatus(user.id);
    }
  };
  
  // Handle auth redirects based on onboarding status
  useAuthRedirects({
    user,
    onboardingCompleted,
    onboardingLoading,
    loading
  });
  
  useEffect(() => {
    let mounted = true;
    
    // Set up the session listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        console.log('🔐 [AUTH PROVIDER] Auth state changed:', event, { userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check onboarding status when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            checkOnboardingStatus(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setOnboardingCompleted(null);
          setOnboardingLoading(false);
        }
      }
    );

    // Get initial session with timeout and error handling
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 10000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Check onboarding status if user exists
          if (session?.user) {
            checkOnboardingStatus(session.user.id);
          }
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        if (mounted) {
          // On error, assume no session and continue
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  // Store current path in localStorage when path changes
  useEffect(() => {
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem("lastVisitedPage", location.pathname);
    }
  }, [location.pathname]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`
      }
    });
  };

  const signOut = async () => {
    await signOutAndCleanup(navigate);
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    });
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
  };


  const value = {
    user,
    session,
    loading,
    onboardingCompleted,
    onboardingLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshOnboardingStatus
  };

  return (
    <AuthContext.Provider value={value}>
      <ReferralSignupHandler />
      {children}
    </AuthContext.Provider>
  );
};
