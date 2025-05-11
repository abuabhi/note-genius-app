
import { useState, useCallback } from 'react';
import { EnhancementFunction } from './noteEnrichment/types';
import { enhancementOptions } from './noteEnrichment/enhancementOptions';
import { usageStats } from './noteEnrichment/usageStats';
import { useUserTier } from './useUserTier';
import { Note } from '@/types/note';

export function useNoteEnrichment(note?: Note) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [error, setError] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  
  const { userTier, isLoading: tierLoading } = useUserTier();
  const { remaining, total, updateUsage } = usageStats();
  const isEnabled = userTier && ['PROFESSOR', 'DEAN'].includes(userTier);
  const currentUsage = total - remaining;
  const monthlyLimit = total;

  const initialize = useCallback(() => {
    setIsProcessing(false);
    setIsLoading(false);
    setError('');
    setSelectedEnhancement(null);
  }, []);

  const processEnhancement = useCallback(async (enhancementType: EnhancementFunction) => {
    if (!note?.content) {
      setError('No content to enhance');
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock enhanced content
      const enhanced = `Enhanced: ${note.content}\n(Using ${enhancementType} on "${note.title}")`;
      
      setEnhancedContent(enhanced);
      updateUsage();
      setIsLoading(false);
      return { success: true, content: enhanced, error: '' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [note, updateUsage]);

  const enrichNote = useCallback(async (
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
  }, [updateUsage]);

  return {
    isProcessing,
    isLoading,
    enhancedContent,
    setEnhancedContent,
    error,
    selectedEnhancement,
    setSelectedEnhancement,
    enhancementOptions,
    remaining,
    total,
    currentUsage,
    monthlyLimit,
    isEnabled,
    initialize,
    processEnhancement,
    enrichNote
  };
}

export default useNoteEnrichment;
