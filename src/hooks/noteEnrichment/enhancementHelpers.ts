
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "./types";

/**
 * Update note with enhancement result in database
 */
export const updateNoteWithEnhancement = async (
  noteId: string, 
  enhancedContent: string, 
  enhancementType: EnhancementFunction,
  originalContent?: string
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
          key_points_generated_at: now,
          key_points_status: 'completed'
        };
        break;
        
      case 'convert-to-markdown':
        updateData = {
          markdown_content: enhancedContent,
          markdown_content_generated_at: now,
          markdown_content_status: 'completed'
        };
        break;
        
      case 'improve-clarity':
        updateData = {
          improved_content: enhancedContent,
          improved_content_generated_at: now,
          improved_content_status: 'completed',
          enhancement_type: 'clarity'
        };
        break;
        
      case 'enrich-note':
        updateData = {
          enriched_content: enhancedContent,
          enriched_content_generated_at: now,
          enriched_status: 'completed'
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
    
    console.log(`✅ Updating note ${noteId} with enhancement:`, {
      enhancementType,
      contentLength: enhancedContent.length,
      updateFields: Object.keys(updateData)
    });
    
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

/**
 * Reset stuck enhancement status to pending
 */
export const resetEnhancementStatus = async (
  noteId: string,
  enhancementType: EnhancementFunction
): Promise<boolean> => {
  try {
    let updateData: Record<string, any> = {};
    
    switch (enhancementType) {
      case 'summarize':
        updateData = { summary_status: 'pending' };
        break;
      case 'extract-key-points':
        updateData = { key_points_status: 'pending' };
        break;
      case 'convert-to-markdown':
        updateData = { markdown_content_status: 'pending' };
        break;
      case 'improve-clarity':
        updateData = { improved_content_status: 'pending' };
        break;
      case 'enrich-note':
        updateData = { enriched_status: 'pending' };
        break;
    }
    
    console.log(`🔄 Resetting ${enhancementType} status for note ${noteId}`);
    
    const { error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error resetting enhancement status:', error);
    return false;
  }
};

/**
 * Set enhancement status to generating
 */
export const setEnhancementGenerating = async (
  noteId: string,
  enhancementType: EnhancementFunction
): Promise<boolean> => {
  try {
    let updateData: Record<string, any> = {};
    
    switch (enhancementType) {
      case 'summarize':
        updateData = { summary_status: 'generating' };
        break;
      case 'extract-key-points':
        updateData = { key_points_status: 'generating' };
        break;
      case 'convert-to-markdown':
        updateData = { markdown_content_status: 'generating' };
        break;
      case 'improve-clarity':
        updateData = { improved_content_status: 'generating' };
        break;
      case 'enrich-note':
        updateData = { enriched_status: 'generating' };
        break;
    }
    
    console.log(`⚡ Setting ${enhancementType} status to generating for note ${noteId}`);
    
    const { error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error setting enhancement status to generating:', error);
    return false;
  }
};

/**
 * Set enhancement status to failed
 */
export const setEnhancementFailed = async (
  noteId: string,
  enhancementType: EnhancementFunction
): Promise<boolean> => {
  try {
    let updateData: Record<string, any> = {};
    
    switch (enhancementType) {
      case 'summarize':
        updateData = { summary_status: 'failed' };
        break;
      case 'extract-key-points':
        updateData = { key_points_status: 'failed' };
        break;
      case 'convert-to-markdown':
        updateData = { markdown_content_status: 'failed' };
        break;
      case 'improve-clarity':
        updateData = { improved_content_status: 'failed' };
        break;
      case 'enrich-note':
        updateData = { enriched_status: 'failed' };
        break;
    }
    
    console.log(`❌ Setting ${enhancementType} status to failed for note ${noteId}`);
    
    const { error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error setting enhancement status to failed:', error);
    return false;
  }
};
