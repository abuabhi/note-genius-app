
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingCheck = (userId: string | undefined) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  
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
    if (userId) {
      checkOnboardingStatus(userId);
    } else {
      setOnboardingCompleted(null);
      setOnboardingLoading(false);
    }
  }, [userId]);

  return {
    onboardingCompleted,
    onboardingLoading,
    checkOnboardingStatus
  };
};
