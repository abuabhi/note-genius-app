import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCleanupExpansions = () => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const cleanupContaminatedExpansions = async () => {
    setIsCleaningUp(true);
    
    try {
      console.log('🧹 Starting cleanup of contaminated content expansions...');
      
      const { data, error } = await supabase.functions.invoke('cleanup-content-expansions', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Cleanup failed');
      }

      console.log('✅ Cleanup completed:', data);
      toast.success(`Cleaned up ${data.cleanedCount || 0} contaminated expansions`);
      
      return data;
    } catch (error) {
      console.error('💥 Cleanup failed:', error);
      toast.error('Failed to cleanup expansions. Please try again.');
      throw error;
    } finally {
      setIsCleaningUp(false);
    }
  };

  return {
    cleanupContaminatedExpansions,
    isCleaningUp
  };
};