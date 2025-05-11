
import { useState } from 'react';
import { EnhancementFunction } from './noteEnrichment/types';
import { enhancementOptions } from './noteEnrichment/enhancementOptions';
import { usageStats } from './noteEnrichment/usageStats';
import { useUserTier } from './useUserTier';

export function useNoteEnrichment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [error, setError] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction>(
    enhancementOptions[0].value as EnhancementFunction
  );
  
  const { userTier, isLoading } = useUserTier();
  const { remaining, updateUsage } = usageStats();
  
  const enrichNote = async (
    noteId: string, 
    content: string, 
    enhancementType: EnhancementFunction,
    title: string = ""
  ) => {
    if (!content) {
      setError('No content to enhance');
      return { success: false, content: '', error: 'No content to enhance' };
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock enhanced content
      const enhanced = `Enhanced: ${content}\n(Using ${enhancementType} on "${title}")`;
      
      setEnhancedContent(enhanced);
      updateUsage();
      return { success: true, content: enhanced, error: '' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    enhancedContent,
    error,
    selectedEnhancement,
    setSelectedEnhancement,
    enhancementOptions,
    remaining,
    enrichNote
  };
}

export default useNoteEnrichment;
