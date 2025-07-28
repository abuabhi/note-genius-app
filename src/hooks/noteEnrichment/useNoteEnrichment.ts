
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { enhancementOptions, getEnhancementDetails } from './enhancementOptions';
import { EnhancementFunction, EnhancementResult } from './types';
import { useUserTier } from '../useUserTier';
import { useEnrichmentUsageStats } from './useEnrichmentUsageStats';
import { useEnrichmentProcessor } from './useEnrichmentProcessor';
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
  
  // Use the proper status management processor
  const { processEnhancement: processEnhancementWithStatus, isLoading: processorLoading } = useEnrichmentProcessor();
  
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

      // Use proper status management with useEnrichmentProcessor
      const result = await processEnhancementWithStatus(
        note.id,
        note.content,
        enhancementType,
        note.title
      );
      
      if (result.success) {
        // Cache the result if applicable
        if (shouldCache(note.content)) {
          setCachedEnhancement(note.content, enhancementType, result.content);
        }
        
        setEnhancedContent(result.content);
        setIsLoading(false);
        
        // Get the enhancement details
        const enhancementDetails = getEnhancementDetails(enhancementType);
        
        return { 
          success: true, 
          content: result.content, 
          error: '',
          enhancementType: enhancementDetails?.outputType 
        };
      } else {
        setError(result.error || 'Enhancement failed');
        setIsLoading(false);
        return { success: false, content: '', error: result.error || 'Enhancement failed' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [note, hasReachedLimit, processEnhancementWithStatus]);

  // Direct note enrichment implementation - NOW USES PROPER STATUS MANAGEMENT
  const enrichNote = useCallback(async (
    noteId: string, 
    content: string, 
    enhancementType: EnhancementFunction,
    title: string = ""
  ): Promise<EnhancementResult> => {
    console.log("🔥 ENRICH NOTE CALLED:", {
      noteId,
      contentLength: content.length,
      enhancementType,
      title,
      hasProcessEnhancementWithStatus: !!processEnhancementWithStatus
    });
    
    if (!content) {
      console.error("❌ NO CONTENT TO ENHANCE");
      setError('No content to enhance');
      return { success: false, content: '', error: 'No content to enhance' };
    }
    
    // Check if user has reached their monthly limit
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

      console.log(`🚀 Starting enhancement ${enhancementType} for note ${noteId}`);
      
      // Use proper status management with useEnrichmentProcessor
      const result = await processEnhancementWithStatus(
        noteId,
        content,
        enhancementType,
        title
      );
      
      if (result.success) {
        // Cache the result if applicable
        if (shouldCache(content)) {
          setCachedEnhancement(content, enhancementType, result.content);
        }
        
        setEnhancedContent(result.content);
        
        // Get the enhancement details
        const enhancementDetails = getEnhancementDetails(enhancementType);
        
        toast.success(`${enhancementDetails?.title || 'Enhancement'} generated successfully`);
        
        return { 
          success: true, 
          content: result.content, 
          error: '',
          enhancementType: enhancementDetails?.outputType
        };
      } else {
        setError(result.error || 'Enhancement failed');
        toast.error("Failed to enhance note");
        return { success: false, content: '', error: result.error || 'Enhancement failed' };
      }
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
  }, [hasReachedLimit, fetchUsageStats, currentUsage, monthlyLimit, userTier, processEnhancementWithStatus]);

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
