
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EnhancementFunction, EnhancementResult } from './types';
import { enrichNote } from './enrichmentService';
import { useEnrichmentUsageStats } from './useEnrichmentUsageStats';
import { getEnhancementDetails } from './enhancementOptions';

/**
 * Hook for processing note enhancements
 */
export const useEnrichmentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [error, setError] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  
  const { hasReachedLimit, fetchUsageStats } = useEnrichmentUsageStats();

  const initialize = useCallback(() => {
    setIsProcessing(false);
    setIsLoading(false);
    setError('');
    setEnhancedContent('');
    setSelectedEnhancement(null);
  }, []);

  // Process enhancement and determine how to apply it
  const processEnhancement = useCallback(async (
    noteId: string,
    noteContent: string,
    enhancementType: EnhancementFunction,
    noteTitle: string = ""
  ): Promise<EnhancementResult> => {
    if (!noteContent) {
      const error = 'No content to enhance';
      setError(error);
      return { success: false, content: '', error };
    }
    
    // Check if user has reached their monthly limit
    if (hasReachedLimit()) {
      const error = 'You have reached your monthly limit for note enhancements';
      setError(error);
      toast.error(error);
      return { success: false, content: '', error };
    }

    setIsLoading(true);
    setIsProcessing(true);
    setError('');
    setSelectedEnhancement(enhancementType);

    try {
      // Call the real enrichment API
      const enhanced = await enrichNote({
        id: noteId,
        title: noteTitle,
        content: noteContent
      }, enhancementType);
      
      setEnhancedContent(enhanced);
      setIsLoading(false);
      
      // Get the enhancement details
      const enhancementDetails = getEnhancementDetails(enhancementType);
      
      return { 
        success: true, 
        content: enhanced, 
        error: '',
        enhancementType: enhancementDetails?.outputType 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
      // Refresh usage stats after operation
      await fetchUsageStats();
    }
  }, [hasReachedLimit, fetchUsageStats]);

  return {
    isProcessing,
    isLoading,
    enhancedContent,
    setEnhancedContent,
    error,
    selectedEnhancement,
    setSelectedEnhancement,
    initialize,
    processEnhancement
  };
};
