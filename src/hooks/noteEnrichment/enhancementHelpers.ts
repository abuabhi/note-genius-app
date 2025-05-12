
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "./types";
import { enhancementOptions } from "./enhancementOptions";

/**
 * Get enhancement details by function type
 */
export const getEnhancementDetails = (enhancementType: EnhancementFunction) => {
  return enhancementOptions.find(option => option.value === enhancementType);
};

/**
 * Update note with enhancement result in database
 */
export const updateNoteWithEnhancement = async (
  noteId: string, 
  enhancedContent: string, 
  enhancementType: EnhancementFunction
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();
    let updateData: Record<string, any> = {};
    
    // Determine which fields to update based on enhancement type
    switch (enhancementType) {
      case 'summarize':
        updateData = {
          summary: enhancedContent,
          summary_generated_at: now,
          summary_status: 'completed'
        };
        break;
        
      case 'extract-key-points':
        updateData = {
          key_points: enhancedContent,
          key_points_generated_at: now
        };
        break;
        
      case 'convert-to-markdown':
        updateData = {
          markdown_content: enhancedContent,
          markdown_content_generated_at: now
        };
        break;
        
      case 'improve-clarity':
        updateData = {
          improved_content: enhancedContent,
          improved_content_generated_at: now
        };
        break;
        
      default:
        // Fallback to summary
        updateData = {
          summary: enhancedContent,
          summary_generated_at: now,
          summary_status: 'completed'
        };
    }
    
    // Update the note with the new enhancement
    const { error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating note with enhancement:', error);
    return false;
  }
};
