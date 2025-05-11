
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboardingStatus = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const checkOnboardingStatus = async () => {
    if (!user) {
      setIsLoading(false);
      setIsOnboardingCompleted(null);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setIsOnboardingCompleted(data?.onboarding_completed ?? false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingCompleted = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setIsOnboardingCompleted(true);
      return true;
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
      return false;
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  return {
    isOnboardingCompleted,
    isLoading,
    checkOnboardingStatus,
    markOnboardingCompleted
  };
};
