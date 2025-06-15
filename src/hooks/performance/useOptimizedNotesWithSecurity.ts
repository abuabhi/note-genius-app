
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { useCallback } from 'react';

export const useOptimizedNotesWithSecurity = () => {
  const optimizedNotes = useOptimizedNotes();

  const secureOperation = useCallback(async (operation: () => Promise<any>) => {
    try {
      // Add security checks here if needed
      return await operation();
    } catch (error) {
      console.error('Secure operation failed:', error);
      throw error;
    }
  }, []);

  return {
    ...optimizedNotes,
    secureOperation
  };
};
