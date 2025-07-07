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
      
      console.log("✅ Enhancement completed successfully");
      
      // Update status to completed
      await updateNoteStatus(noteId, enhancementType, 'completed');
      
      return { success: true, content: result };
    } catch (error) {
      console.error("❌ Enhancement failed:", error);
      
      // Update status to failed
      await updateNoteStatus(noteId, enhancementType, 'failed');
      
      return { 
        success: false, 
        content: '', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { processEnhancement, isLoading };
};