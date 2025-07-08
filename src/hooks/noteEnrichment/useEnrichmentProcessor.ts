import { useState } from 'react';
import { callEnrichmentAPI } from "./apiService";
import { EnhancementFunction } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { extractErrorMessage, logErrorWithContext } from "@/utils/errorUtils";

interface EnrichmentResult {
  success: boolean;
  content: string;
  error?: string;
}

export const useEnrichmentProcessor = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateNoteStatus = async (noteId: string, enhancementType: string, status: 'generating' | 'completed' | 'failed') => {
    const statusField = `${enhancementType.replace(/-/g, '_')}_status`;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ [statusField]: status })
        .eq('id', noteId);
        
      if (error) {
        console.error(`❌ Failed to update ${statusField}:`, error);
        throw error;
      }
      console.log(`✅ Updated ${statusField} to ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update note status:`, error);
      throw error;
    }
  };

  const saveEnhancedContent = async (noteId: string, enhancementType: string, content: string) => {
    const contentField = getContentFieldName(enhancementType);
    const statusField = `${enhancementType.replace(/-/g, '_')}_status`;
    const generatedAtField = getGeneratedAtFieldName(enhancementType);
    
    try {
      // Use transaction for consistency
      const { error } = await supabase
        .from('notes')
        .update({ 
          [contentField]: content,
          [statusField]: 'completed',
          [generatedAtField]: new Date().toISOString()
        })
        .eq('id', noteId);
        
      if (error) {
        console.error(`❌ Failed to save ${contentField}:`, error);
        throw error;
      }
      console.log(`✅ Saved content to ${contentField}`);
    } catch (error) {
      console.error(`❌ Failed to save enhanced content:`, error);
      throw error;
    }
  };

  const getContentFieldName = (enhancementType: string): string => {
    const mappings: Record<string, string> = {
      'summarize': 'summary',
      'extract-key-points': 'key_points', 
      'improve-clarity': 'improved_content',
      'convert-to-markdown': 'markdown_content',
      'enrich-note': 'enriched_content'
    };
    
    return mappings[enhancementType] || 'enriched_content';
  };

  const getGeneratedAtFieldName = (enhancementType: string): string => {
    const mappings: Record<string, string> = {
      'summarize': 'summary_generated_at',
      'extract-key-points': 'key_points_generated_at', 
      'improve-clarity': 'improved_content_generated_at',
      'convert-to-markdown': 'markdown_content_generated_at',
      'enrich-note': 'enriched_content_generated_at'
    };
    
    return mappings[enhancementType] || 'enriched_content_generated_at';
  };

  const processEnhancement = async (
    noteId: string,
    content: string,
    enhancementType: EnhancementFunction,
    title?: string
  ): Promise<EnrichmentResult> => {
    console.log("🚀 Starting enhancement processing:", enhancementType);
    setIsLoading(true);
    
    try {
      // Update status to generating
      await updateNoteStatus(noteId, enhancementType, 'generating');
      
      // Call the API
      const result = await callEnrichmentAPI(
        { id: noteId, content, title },
        enhancementType
      );
      
      // Save the content to database
      await saveEnhancedContent(noteId, enhancementType, result);
      
      console.log("✅ Enhancement completed successfully");
      return { success: true, content: result };
      
    } catch (error) {
      logErrorWithContext(error, "Enhancement processing", { noteId, enhancementType });
      
      // Update status to failed
      try {
        await updateNoteStatus(noteId, enhancementType, 'failed');
      } catch (statusError) {
        logErrorWithContext(statusError, "Failed to update status to failed", { noteId, enhancementType });
      }
      
      // Extract clean error message using utility
      const errorInfo = extractErrorMessage(error);
      
      return { 
        success: false, 
        content: '', 
        error: errorInfo.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { processEnhancement, isLoading };
};