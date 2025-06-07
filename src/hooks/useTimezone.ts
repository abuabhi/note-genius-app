
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useTimezone = () => {
  const { user } = useAuth();
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserTimezone = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user's stored timezone from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', user.id)
          .single();

        if (profile?.timezone) {
          setTimezone(profile.timezone);
        } else {
          // Auto-detect and save timezone if not set
          const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setTimezone(detectedTimezone);
          
          // Save detected timezone to profile
          await supabase
            .from('profiles')
            .update({ timezone: detectedTimezone })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error loading timezone:', error);
        // Fallback to browser detection
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTimezone();
  }, [user]);

  const updateTimezone = async (newTimezone: string) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ timezone: newTimezone })
        .eq('id', user.id);
      
      setTimezone(newTimezone);
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  };

  return {
    timezone,
    updateTimezone,
    isLoading
  };
};
