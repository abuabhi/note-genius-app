
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { enhancementOptions, getEnhancementDetails } from './enhancementOptions';
import { EnhancementFunction, EnhancementResult } from './types';
import { enrichNote as enrichNoteService } from './enrichmentService';
import { useUserTier } from '../useUserTier';
import { useEnrichmentUsageStats } from './useEnrichmentUsageStats';
import { updateNoteWithEnhancement } from './enhancementHelpers';
import { useConcurrencyManager } from '../performance/useConcurrencyManager';
import { useEnhancementCache } from '../performance/useEnhancementCache';

/**
 * Hook for managing note enrichment functionality
 */
export const useNoteEnrichment = (note?: Note) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [error, setError] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  
  const { userTier, isLoading: tierLoading } = useUserTier();
  const { 
    currentUsage, 
    monthlyLimit, 
    isLoading: usageLoading, 
    hasReachedLimit,
    fetchUsageStats 
  } = useEnrichmentUsageStats();
  
  const { executeRequest, getConcurrencyStats } = useConcurrencyManager();
  const { 
    getCachedEnhancement, 
    setCachedEnhancement, 
    shouldCache,
    getCacheStats 
  } = useEnhancementCache();

  const initialize = useCallback(() => {
    setIsProcessing(false);
    setIsLoading(false);
    setError('');
    setEnhancedContent('');
    setSelectedEnhancement(null);
    setProgress(0);
    setCurrentChunk(0);
    setTotalChunks(0);
  }, []);

  // Process enhancement and determine how to apply it
  const processEnhancement = useCallback(async (enhancementType: EnhancementFunction): Promise<EnhancementResult> => {
    if (!note?.content) {
      const error = 'No content to enhance';
      setError(error);
      return { success: false, content: '', error };
    }
    
    // FIXED: Check if user has reached their monthly limit with proper unlimited handling
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
      // Check cache first
      if (shouldCache(note.content)) {
        const cached = getCachedEnhancement(note.content, enhancementType);
        if (cached) {
          setEnhancedContent(cached);
          setIsLoading(false);
          toast.success('Enhancement loaded from cache');
          
          const enhancementDetails = getEnhancementDetails(enhancementType);
          return { 
            success: true, 
            content: cached, 
            error: '',
            enhancementType: enhancementDetails?.outputType 
          };
        }
      }

      // Execute with concurrency management
      const enhanced = await executeRequest(
        () => enrichNoteService({
          id: note.id,
          title: note.title,
          content: note.content,
          category: note.subject
        }, enhancementType),
        {
          priority: 'high',
          requestType: 'enhancement'
        }
      );
      
      // Cache the result if applicable
      if (shouldCache(note.content)) {
        setCachedEnhancement(note.content, enhancementType, enhanced);
      }
      
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
    }
  }, [note, hasReachedLimit]);

  // Direct note enrichment implementation
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
    
    // FIXED: Check if user has reached their monthly limit with debug logging
    const limitReached = hasReachedLimit();
    console.log("🔍 Enhancement limit check:", { 
      currentUsage, 
      monthlyLimit, 
      limitReached,
      userTier 
    });
    
    if (limitReached) {
      const error = 'You have reached your monthly limit for note enhancements';
      setError(error);
      toast.error(error);
      return { success: false, content: '', error };
    }

    setIsProcessing(true);
    setError('');
    setSelectedEnhancement(enhancementType);

    try {
      // Check cache first
      if (shouldCache(content)) {
        const cached = getCachedEnhancement(content, enhancementType);
        if (cached) {
          setEnhancedContent(cached);
          toast.success('Enhancement loaded from cache');
          
          const enhancementDetails = getEnhancementDetails(enhancementType);
          return { 
            success: true, 
            content: cached, 
            error: '',
            enhancementType: enhancementDetails?.outputType 
          };
        }
      }

      // Execute with concurrency management and user identification
      const enhanced = await executeRequest(
        () => enrichNoteService({
          id: noteId,
          title: title,
          content: content
        }, enhancementType),
        {
          priority: 'high',
          requestType: 'enhancement'
        }
      );
      
      // Cache the result if applicable
      if (shouldCache(content)) {
        setCachedEnhancement(content, enhancementType, enhanced);
      }
      
      setEnhancedContent(enhanced);
      
      // Get the enhancement details
      const enhancementDetails = getEnhancementDetails(enhancementType);
      
      // Store enrichment in the database
      try {
        const success = await updateNoteWithEnhancement(noteId, enhanced, enhancementType);
        
        if (success) {
          toast.success(`${enhancementDetails?.title || 'Enhancement'} generated successfully`);
        }
      } catch (dbError) {
        console.error('Error updating note with enhancement:', dbError);
        // Even if db update fails, we can still return the enhanced content
      }
      
      return { 
        success: true, 
        content: enhanced, 
        error: '',
        enhancementType: enhancementDetails?.outputType
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error("Failed to enhance note");
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
      // Refresh usage stats after operation completes
      await fetchUsageStats();
    }
  }, [hasReachedLimit, fetchUsageStats, currentUsage, monthlyLimit, userTier]);

  return {
    isProcessing,
    isLoading,
    enhancedContent,
    setEnhancedContent,
    error,
    enhancementOptions,
    currentUsage,
    monthlyLimit,
    isEnabled: userTier && ['MASTER', 'DEAN'].includes(userTier),
    initialize,
    processEnhancement,
    enrichNote,
    selectedEnhancement,
    setSelectedEnhancement,
    hasReachedLimit,
    getEnhancementDetails,
    // Progress tracking for chunked operations
    progress,
    currentChunk,
    totalChunks,
    // Performance monitoring
    getConcurrencyStats,
    getCacheStats
  };
};

export default useNoteEnrichment;
