
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export enum UserTier {
  SCHOLAR = 'SCHOLAR',
  GRADUATE = 'GRADUATE',
  MASTER = 'MASTER',
  DEAN = 'DEAN'
}

export interface UserProfile {
  id: string;
  username: string | null;
  user_tier: UserTier;
  avatar_url: string | null;
  created_at: string | null;
}

export interface TierLimits {
  max_notes: number;
  max_storage_mb: number;
  max_flashcards: number;
  ocr_enabled: boolean;
  ai_features_enabled: boolean;
  collaboration_enabled: boolean;
  priority_support: boolean;
}

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const navigate = useNavigate();
  const isAuthorized = !!user;

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
          
          // Convert the string tier to UserTier enum
          const profileWithEnumTier = {
            ...data,
            user_tier: data.user_tier as UserTier
          };
          
          setUserProfile(profileWithEnumTier);
          
          // Set tier limits based on user tier
          const limits = getTierLimits(profileWithEnumTier.user_tier);
          setTierLimits(limits);
          
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [user, authLoading, navigate, redirectTo]);
  
  // Define tier limits based on user tier
  const getTierLimits = (tier: UserTier): TierLimits => {
    switch(tier) {
      case UserTier.DEAN:
        return {
          max_notes: Infinity,
          max_storage_mb: 10000,
          max_flashcards: Infinity,
          ocr_enabled: true,
          ai_features_enabled: true,
          collaboration_enabled: true,
          priority_support: true
        };
      case UserTier.MASTER:
        return {
          max_notes: 1000,
          max_storage_mb: 5000,
          max_flashcards: 5000,
          ocr_enabled: true,
          ai_features_enabled: true,
          collaboration_enabled: true,
          priority_support: true
        };
      case UserTier.GRADUATE:
        return {
          max_notes: 500,
          max_storage_mb: 1000,
          max_flashcards: 1000,
          ocr_enabled: true,
          ai_features_enabled: false,
          collaboration_enabled: true,
          priority_support: false
        };
      case UserTier.SCHOLAR:
      default:
        return {
          max_notes: 100,
          max_storage_mb: 250,
          max_flashcards: 250,
          ocr_enabled: false,
          ai_features_enabled: false,
          collaboration_enabled: false,
          priority_support: false
        };
    }
  };

  // Return both user and profile along with helper properties
  return { 
    user, 
    userProfile, 
    profile: userProfile, // Alias for backward compatibility 
    loading: authLoading || loading,
    isAuthorized,
    tierLimits
  };
};
