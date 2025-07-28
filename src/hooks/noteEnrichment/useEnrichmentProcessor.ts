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

  const getStatusFieldName = (enhancementType: string): string => {
    const mappings: Record<string, string> = {
      'summarize': 'summary_status',
      'extract-key-points': 'key_points_status', 
      'generate-questions': 'questions_status',
      'convert-to-markdown': 'markdown_content_status',
      'enrich-note': 'enriched_status'
    };
    
    return mappings[enhancementType] || 'enriched_status';
  };

  const updateNoteStatus = async (noteId: string, enhancementType: string, status: 'generating' | 'completed' | 'failed') => {
    const statusField = getStatusFieldName(enhancementType);
    
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
    const statusField = getStatusFieldName(enhancementType);
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
      'generate-questions': 'questions_content',
      'convert-to-markdown': 'markdown_content',
      'enrich-note': 'enriched_content'
    };
    
    return mappings[enhancementType] || 'enriched_content';
  };

  const getGeneratedAtFieldName = (enhancementType: string): string => {
    const mappings: Record<string, string> = {
      'summarize': 'summary_generated_at',
      'extract-key-points': 'key_points_generated_at', 
      'generate-questions': 'questions_generated_at',
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
    console.log(`📝 Note content length: ${content?.length || 0} characters`);
    console.log(`📊 Enhancement details:`, { noteId, enhancementType, title });
    setIsLoading(true);
    
    // Set up timeout protection to prevent stuck states
    const PROCESSING_TIMEOUT = 60000; // 60 seconds
    const timeoutId = setTimeout(async () => {
      console.error(`⏰ Enhancement processing timeout after ${PROCESSING_TIMEOUT/1000}s, marking as failed`);
      try {
        await updateNoteStatus(noteId, enhancementType, 'failed');
      } catch (error) {
        console.error('❌ Failed to update status to failed on timeout:', error);
      }
      setIsLoading(false);
    }, PROCESSING_TIMEOUT);
    
    try {
      // Validate inputs
      if (!content || content.trim() === '') {
        throw new Error('No content to enhance');
      }
      
      console.log("📊 Updating status to generating...");
      // Update status to generating
      await updateNoteStatus(noteId, enhancementType, 'generating');
      console.log("✅ Status updated to generating");
      
      console.log("🔗 Calling enhancement API...");
      // Call the enhancement API directly - timeout is handled in apiService
      const result = await callEnrichmentAPI(
        { id: noteId, content, title },
        enhancementType
      );
      console.log(`✅ API call completed, result length: ${result?.length || 0}`);
      
      if (!result || result.trim() === '') {
        throw new Error('Empty response from enhancement API');
      }
      
      console.log("💾 Saving enhanced content...");
      // Save the content to database
      await saveEnhancedContent(noteId, enhancementType, result);
      console.log("✅ Content saved successfully");
      
      console.log("✅ Enhancement completed successfully");
      return { success: true, content: result };
      
    } catch (error) {
      console.error("❌ Enhancement processing failed:", error);
      logErrorWithContext(error, "Enhancement processing", { noteId, enhancementType });
      
      // Update status to failed with detailed error logging
      try {
        console.log("⚠️ Updating status to failed...");
        await updateNoteStatus(noteId, enhancementType, 'failed');
        console.log("✅ Status updated to failed");
      } catch (statusError) {
        console.error("❌ Failed to update status to failed:", statusError);
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
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return { processEnhancement, isLoading };
};