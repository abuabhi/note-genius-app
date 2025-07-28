
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { enhancementOptions, getEnhancementDetails } from './enhancementOptions';
import { EnhancementFunction, EnhancementResult } from './types';
import { useUserTier } from '../useUserTier';
import { useEnrichmentUsageStats } from './useEnrichmentUsageStats';
import { callEnrichmentAPI } from './apiService';
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
  
  // State for tracking processing stages
  const [processingStage, setProcessingStage] = useState('');
  
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

      // Use direct API call (will be implemented by enrichNote function below)
      setIsLoading(true);
      setIsProcessing(true);
      setError('');
      setSelectedEnhancement(enhancementType);

      // Call API directly
      const result = await callEnrichmentAPI(
        { id: note.id, content: note.content, title: note.title },
        enhancementType
      );

      const enhancementResult = {
        success: true,
        content: result,
        error: '',
        enhancementType: getEnhancementDetails(enhancementType)?.outputType
      };
      
      // Cache the result if applicable
      if (shouldCache(note.content)) {
        setCachedEnhancement(note.content, enhancementType, enhancementResult.content);
      }
      
      setEnhancedContent(enhancementResult.content);
      setIsLoading(false);
      
      return enhancementResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [note, hasReachedLimit]);

  // Helper functions for status management
  const updateNoteStatus = async (noteId: string, enhancementType: string, status: 'generating' | 'completed' | 'failed') => {
    const statusMappings: Record<string, string> = {
      'summarize': 'summary_status',
      'extract-key-points': 'key_points_status', 
      'generate-questions': 'questions_status',
      'convert-to-markdown': 'markdown_content_status',
      'enrich-note': 'enriched_status'
    };
    
    const statusField = statusMappings[enhancementType] || 'enriched_status';
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ [statusField]: status })
        .eq('id', noteId);
        
      if (error) throw error;
      console.log(`✅ Updated ${statusField} to ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update note status:`, error);
      throw error;
    }
  };

  const saveEnhancedContent = async (noteId: string, enhancementType: string, content: string) => {
    const contentMappings: Record<string, string> = {
      'summarize': 'summary',
      'extract-key-points': 'key_points', 
      'generate-questions': 'questions_content',
      'convert-to-markdown': 'markdown_content',
      'enrich-note': 'enriched_content'
    };

    const statusMappings: Record<string, string> = {
      'summarize': 'summary_status',
      'extract-key-points': 'key_points_status', 
      'generate-questions': 'questions_status',
      'convert-to-markdown': 'markdown_content_status',
      'enrich-note': 'enriched_status'
    };

    const generatedAtMappings: Record<string, string> = {
      'summarize': 'summary_generated_at',
      'extract-key-points': 'key_points_generated_at', 
      'generate-questions': 'questions_generated_at',
      'convert-to-markdown': 'markdown_content_generated_at',
      'enrich-note': 'enriched_content_generated_at'
    };
    
    const contentField = contentMappings[enhancementType] || 'enriched_content';
    const statusField = statusMappings[enhancementType] || 'enriched_status';
    const generatedAtField = generatedAtMappings[enhancementType] || 'enriched_content_generated_at';
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          [contentField]: content,
          [statusField]: 'completed',
          [generatedAtField]: new Date().toISOString()
        })
        .eq('id', noteId);
        
      if (error) throw error;
      console.log(`✅ Saved content to ${contentField}`);
    } catch (error) {
      console.error(`❌ Failed to save enhanced content:`, error);
      throw error;
    }
  };

  // Simplified enrichNote function with direct API call
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
      title
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
    setIsLoading(true);
    setError('');
    setSelectedEnhancement(enhancementType);
    setProcessingStage('Starting...');

    try {
      // Check cache first
      if (shouldCache(content)) {
        const cached = getCachedEnhancement(content, enhancementType);
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

      console.log(`🚀 Starting enhancement ${enhancementType} for note ${noteId}`);
      
      // Step 1: Update status to generating with UI feedback
      setProcessingStage('Updating status...');
      await updateNoteStatus(noteId, enhancementType, 'generating');
      
      // Step 2: Call API directly with UI feedback
      setProcessingStage('Calling AI service...');
      const result = await callEnrichmentAPI(
        { id: noteId, content, title },
        enhancementType
      );
      
      if (!result || result.trim() === '') {
        throw new Error('Empty response from enhancement API');
      }
      
      // Step 3: Save content with UI feedback
      setProcessingStage('Saving results...');
      await saveEnhancedContent(noteId, enhancementType, result);
      
      // Step 4: Update UI and cache
      setProcessingStage('Finalizing...');
      if (shouldCache(content)) {
        setCachedEnhancement(content, enhancementType, result);
      }
      
      setEnhancedContent(result);
      setIsLoading(false);
      
      const enhancementDetails = getEnhancementDetails(enhancementType);
      toast.success(`${enhancementDetails?.title || 'Enhancement'} generated successfully`);
      
      return { 
        success: true, 
        content: result, 
        error: '',
        enhancementType: enhancementDetails?.outputType
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("❌ Enhancement failed:", err);
      
      // Update status to failed
      try {
        await updateNoteStatus(noteId, enhancementType, 'failed');
      } catch (statusError) {
        console.error("❌ Failed to update status to failed:", statusError);
      }
      
      setError(errorMessage);
      setIsLoading(false);
      toast.error("Failed to enhance note");
      return { success: false, content: '', error: errorMessage };
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
      // Refresh usage stats after operation completes
      await fetchUsageStats();
    }
  }, [hasReachedLimit, fetchUsageStats, currentUsage, monthlyLimit, userTier, shouldCache, getCachedEnhancement, setCachedEnhancement, getEnhancementDetails]);

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
    getCacheStats,
    // Processing stage for UI feedback
    processingStage
  };
};

export default useNoteEnrichment;
