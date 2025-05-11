
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check onboarding status manually instead of using the hook
  const checkOnboardingStatus = async (userId: string) => {
    if (!userId) {
      setOnboardingLoading(false);
      setOnboardingCompleted(null);
      return;
    }

    try {
      setOnboardingLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setOnboardingCompleted(data?.onboarding_completed ?? false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
    } finally {
      setOnboardingLoading(false);
    }
  };
  
  useEffect(() => {
    // Set up the session listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check onboarding status when auth state changes
        if (session?.user) {
          setTimeout(() => {
            checkOnboardingStatus(session.user.id);
          }, 0);
        } else {
          setOnboardingCompleted(null);
          setOnboardingLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check initial onboarding status
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setOnboardingLoading(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Redirect to onboarding if needed
  useEffect(() => {
    // Skip redirection while still loading
    if (loading || onboardingLoading) {
      return;
    }
    
    // Only redirect if user exists and we know their onboarding status
    if (user) {
      // Handle onboarding redirection
      if (onboardingCompleted === false) {
        // Only redirect if user is not already on onboarding page 
        // and not on pages that don't require onboarding
        if (!location.pathname.includes('/onboarding') &&
            !location.pathname.includes('/login') && 
            !location.pathname.includes('/signup')) {
          navigate('/onboarding');
        }
      } else if (onboardingCompleted === true && location.pathname === '/onboarding') {
        // If onboarding is complete and user is on onboarding page, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, onboardingCompleted, onboardingLoading, navigate, location.pathname, loading]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    });
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
