import { useState } from 'react';
import { callEnrichmentAPI } from "./apiService";
import { EnhancementFunction } from "./types";
import { supabase } from "@/integrations/supabase/client";

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
        console.warn(`Failed to update ${statusField}:`, error);
      } else {
        console.log(`✅ Updated ${statusField} to ${status}`);
      }
    } catch (error) {
      console.warn(`Failed to update note status:`, error);
    }
  };

  const saveEnhancedContent = async (noteId: string, enhancementType: string, content: string) => {
    const contentField = getContentFieldName(enhancementType);
    const statusField = `${enhancementType.replace(/-/g, '_')}_status`;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          [contentField]: content,
          [statusField]: 'completed',
          [`${enhancementType.replace(/-/g, '_')}_generated_at`]: new Date().toISOString()
        })
        .eq('id', noteId);
        
      if (error) {
        console.error(`Failed to save ${contentField}:`, error);
        throw error;
      } else {
        console.log(`✅ Saved content to ${contentField}`);
      }
    } catch (error) {
      console.error(`Failed to save enhanced content:`, error);
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

  const processEnhancement = async (
    noteId: string,
    content: string,
    enhancementType: EnhancementFunction,
    title?: string
  ): Promise<EnrichmentResult> => {
    console.log("🚀 Starting enhancement processing:", enhancementType);
    setIsLoading(true);
    
    // Update status to generating immediately
    await updateNoteStatus(noteId, enhancementType, 'generating');
    
    try {
      const result = await callEnrichmentAPI(
        { id: noteId, content, title },
        enhancementType
      );
      
      console.log("✅ Enhancement completed successfully, saving to database");
      
      // CRITICAL FIX: Save the actual content to the database
      await saveEnhancedContent(noteId, enhancementType, result);
      
      return { success: true, content: result };
    } catch (error) {
      console.error("❌ Enhancement failed:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error constructor:", error?.constructor?.name);
      
      // Update status to failed
      await updateNoteStatus(noteId, enhancementType, 'failed');
      
      // Enhanced error message extraction
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      console.error("🔍 Final error message being returned:", errorMessage);
      
      return { 
        success: false, 
        content: '', 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { processEnhancement, isLoading };
};