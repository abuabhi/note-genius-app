
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useEnrichmentService } from './noteEnrichment/enrichmentService';
import { useNoteEnrichmentStats } from './noteEnrichment/usageStats';
import { enhancementOptions } from './noteEnrichment/enhancementOptions';
import { EnhancementFunction, EnhancementOption, TokenUsage } from './noteEnrichment/types';

// Re-export types so consumers don't need to import from multiple files
export type { EnhancementFunction, EnhancementOption, TokenUsage };
export { enhancementOptions };

export const useNoteEnrichment = () => {
  const { user } = useAuth();
  const { tierLimits } = useUserTier();
  
  // Get enrichment service functionality
  const { 
    enrichNote: serviceEnrichNote,
    isLoading,
    enhancedContent,
    setEnhancedContent
  } = useEnrichmentService();
  
  // Get usage statistics functionality
  const {
    currentUsage,
    monthlyLimit,
    lastTokenUsage,
    setLastTokenUsage,
    fetchUsageStats
  } = useNoteEnrichmentStats();
  
  // Wrap the enrichNote function to include user and tier checks
  const enrichNote = async (
    noteId: string, 
    noteContent: string, 
    enhancementType: EnhancementFunction,
    noteTitle?: string
  ) => {
    const result = await serviceEnrichNote(
      noteId,
      noteContent,
      enhancementType,
      user?.id,
      tierLimits?.note_enrichment_enabled || false,
      noteTitle
    );
    
    if (result) {
      setLastTokenUsage(result.tokenUsage);
      // Refresh usage statistics after successful enrichment
      await fetchUsageStats(user?.id);
      return result.enhancedContent;
    }
    
    return null;
  };
  
  // Initialize by fetching current usage
  const initialize = async () => {
    await fetchUsageStats(user?.id);
  };
  
  return {
    enrichNote,
    isLoading,
    enhancedContent,
    currentUsage,
    monthlyLimit,
    lastTokenUsage,
    isEnabled: tierLimits?.note_enrichment_enabled || false,
    initialize,
    enhancementOptions
  };
};
