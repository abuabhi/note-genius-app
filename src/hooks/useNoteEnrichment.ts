
import { useState, useCallback, useEffect } from 'react';
import { EnhancementFunction, EnhancementResult } from './noteEnrichment/types';
import { enhancementOptions } from './noteEnrichment/enhancementOptions';
import { useUserTier } from './useUserTier';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { enrichNote as callEnrichmentAPI } from './noteEnrichment/enrichmentService';

export function useNoteEnrichment(note?: Note) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [error, setError] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  
  const { userTier, isLoading: tierLoading } = useUserTier();
  
  // Fetch usage stats when hook mounts or userTier changes
  useEffect(() => {
    const fetchUsage = async () => {
      if (!userTier) return;
      
      try {
        // Get current month in YYYY-MM format
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        // Get usage count
        const { data: usageData, error: usageError } = await supabase
          .from('note_enrichment_usage')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('month_year', currentMonth);
        
        if (usageError) throw usageError;
        
        // Get tier limit
        const { data: tierData, error: tierError } = await supabase
          .from('tier_limits')
          .select('note_enrichment_limit_per_month')
          .eq('tier', userTier)
          .single();
        
        if (tierError) throw tierError;
        
        setCurrentUsage(usageData?.length || 0);
        setMonthlyLimit(tierData?.note_enrichment_limit_per_month);
        
      } catch (err) {
        console.error('Error fetching usage stats:', err);
      }
    };
    
    fetchUsage();
  }, [userTier]);

  const updateUsage = useCallback(async (noteId: string, tokenUsage?: { prompt_tokens: number, completion_tokens: number }) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Insert usage record
      const { error } = await supabase
        .from('note_enrichment_usage')
        .insert({
          user_id: userId,
          note_id: noteId,
          month_year: currentMonth,
          llm_provider: 'openai',
          prompt_tokens: tokenUsage?.prompt_tokens || 0,
          completion_tokens: tokenUsage?.completion_tokens || 0
        });
      
      if (error) throw error;
      
      // Update local count
      setCurrentUsage(prev => prev + 1);
      
    } catch (err) {
      console.error('Error updating usage:', err);
    }
  }, []);

  const initialize = useCallback(() => {
    setIsProcessing(false);
    setIsLoading(false);
    setError('');
    setSelectedEnhancement(null);
  }, []);

  const hasReachedLimit = useCallback(() => {
    // No limit if monthlyLimit is null (unlimited)
    if (monthlyLimit === null) return false;
    
    // Has reached limit if current usage >= monthly limit
    return currentUsage >= monthlyLimit;
  }, [currentUsage, monthlyLimit]);

  // Real implementation using the edge function
  const processEnhancement = useCallback(async (enhancementType: EnhancementFunction): Promise<EnhancementResult> => {
    if (!note?.content) {
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
      const enhanced = await callEnrichmentAPI({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category
      }, enhancementType);
      
      setEnhancedContent(enhanced);
      await updateUsage(note.id);
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
  }, [note, updateUsage, hasReachedLimit]);

  // Real implementation for direct note enrichment
  const enrichNote = useCallback(async (
    noteId: string, 
    content: string, 
    enhancementType: EnhancementFunction,
    title: string = ""
  ): Promise<EnhancementResult> => {
    if (!content) {
      setError('No content to enhance');
      return { success: false, content: '', error: 'No content to enhance' };
    }
    
    // Check if user has reached their monthly limit
    if (hasReachedLimit()) {
      const error = 'You have reached your monthly limit for note enhancements';
      setError(error);
      toast.error(error);
      return { success: false, content: '', error };
    }

    setIsProcessing(true);
    setError('');
    setSelectedEnhancement(enhancementType);

    try {
      // Call the real enrichment API
      const enhanced = await callEnrichmentAPI({
        id: noteId,
        title: title,
        content: content
      }, enhancementType);
      
      setEnhancedContent(enhanced);
      await updateUsage(noteId);
      toast.success("Note enhanced successfully");
      return { success: true, content: enhanced, error: '' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error("Failed to enhance note");
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [updateUsage, hasReachedLimit]);

  return {
    isProcessing,
    isLoading,
    enhancedContent,
    setEnhancedContent,
    error,
    enhancementOptions,
    currentUsage,
    monthlyLimit,
    isEnabled: userTier && ['PROFESSOR', 'DEAN', 'MASTER'].includes(userTier),
    initialize,
    processEnhancement,
    enrichNote,
    updateUsage,
    selectedEnhancement,
    setSelectedEnhancement,
    hasReachedLimit
  };
}

export default useNoteEnrichment;
