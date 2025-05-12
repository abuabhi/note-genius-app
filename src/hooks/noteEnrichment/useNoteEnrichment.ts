
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { enhancementOptions } from './enhancementOptions';
import { EnhancementFunction, EnhancementResult, EnhancementType } from './types';
import { enrichNote as callEnrichmentAPI } from './enrichmentService';
import { useUserTier } from '../useUserTier';
import { useEnrichmentUsageStats } from './useEnrichmentUsageStats';

/**
 * Hook for managing note enrichment functionality
 */
export const useNoteEnrichment = (note?: Note) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [error, setError] = useState('');
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  
  const { userTier, isLoading: tierLoading } = useUserTier();
  const { 
    currentUsage, 
    monthlyLimit, 
    isLoading: usageLoading, 
    hasReachedLimit,
    fetchUsageStats 
  } = useEnrichmentUsageStats();

  const initialize = useCallback(() => {
    setIsProcessing(false);
    setIsLoading(false);
    setError('');
    setSelectedEnhancement(null);
  }, []);

  // Get the enhancement details by function type
  const getEnhancementDetails = useCallback((enhancementType: EnhancementFunction) => {
    return enhancementOptions.find(option => option.value === enhancementType);
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
      // Call the real enrichment API
      const enhanced = await callEnrichmentAPI({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category
      }, enhancementType);
      
      setEnhancedContent(enhanced);
      // Usage tracking happens in enrichNote
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
  }, [note, hasReachedLimit, getEnhancementDetails]);

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
      // Usage tracking happens in enrichNote
      
      // Get the enhancement details
      const enhancementDetails = getEnhancementDetails(enhancementType);
      
      // CRITICAL FIX: For summary and key points, ALWAYS store in separate fields,
      // never replace the original content
      if (enhancementType === 'summarize' || enhancementType === 'extract-key-points') {
        // Always store summary and key points in their own fields
        let updateData: any = {};
        
        if (enhancementType === 'summarize') {
          updateData = { 
            summary: enhanced,
            summary_generated_at: new Date().toISOString()
          };
          toast.success("Summary generated successfully");
        } else if (enhancementType === 'extract-key-points') {
          updateData = { 
            enhancements: { 
              keyPoints: enhanced, 
              last_enhanced_at: new Date().toISOString() 
            } 
          };
          toast.success("Key points extracted successfully");
        }
        
        // Update the note in the database
        try {
          const { error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', noteId);
            
          if (error) throw error;
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
      } else if (enhancementDetails?.replaceContent) {
        // For other enhancement types that should replace content
        toast.success("Note enhanced successfully");
        return { 
          success: true, 
          content: enhanced, 
          error: '',
          enhancementType: enhancementDetails?.outputType
        };
      } else {
        // Store in enhancements object
        let updateData = {
          enhancements: {
            [enhancementDetails?.outputType || 'enhanced']: enhanced,
            last_enhanced_at: new Date().toISOString()
          }
        };
        
        try {
          const { error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', noteId);
            
          if (error) throw error;
            
          toast.success(`${enhancementDetails?.title || 'Enhancement'} generated successfully`);
        } catch (dbError) {
          console.error('Error updating note with enhancement:', dbError);
        }
        
        return { 
          success: true, 
          content: enhanced, 
          error: '',
          enhancementType: enhancementDetails?.outputType
        };
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
  }, [hasReachedLimit, getEnhancementDetails, fetchUsageStats]);

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
    selectedEnhancement,
    setSelectedEnhancement,
    hasReachedLimit,
    getEnhancementDetails
  };
};

export default useNoteEnrichment;
