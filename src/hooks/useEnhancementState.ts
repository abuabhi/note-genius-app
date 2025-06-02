
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancementState = (noteId: string) => {
  const [enhancementState, setEnhancementState] = useState<{
    hasSummary: boolean;
    hasKeyPoints: boolean;
    hasMarkdown: boolean;
    hasImprovedClarity: boolean;
    isLoading: boolean;
  }>({
    hasSummary: false,
    hasKeyPoints: false,
    hasMarkdown: false,
    hasImprovedClarity: false,
    isLoading: true
  });

  // Enhanced validation with minimum length and timestamp requirements
  const validateContent = useCallback((content: string | null | undefined, timestamp?: string | null): boolean => {
    const hasValidContent = Boolean(
      content && 
      typeof content === 'string' && 
      content.trim().length > 10
    );
    
    // For improved content, also require a timestamp to ensure it was properly generated
    const hasTimestamp = Boolean(timestamp);
    
    return hasValidContent && (timestamp !== undefined ? hasTimestamp : true);
  }, []);

  const updateEnhancementState = useCallback((note: Partial<Note>) => {
    const newState = {
      hasSummary: validateContent(note.summary),
      hasKeyPoints: validateContent(note.key_points),
      hasMarkdown: validateContent(note.markdown_content),
      hasImprovedClarity: validateContent(note.improved_content, note.improved_content_generated_at),
      isLoading: false
    };

    console.log("🔄 Enhancement state updated (FIXED):", {
      noteId,
      newState,
      rawContent: {
        summary: note.summary?.substring(0, 50) || 'none',
        key_points: note.key_points?.substring(0, 50) || 'none',
        markdown_content: note.markdown_content?.substring(0, 50) || 'none',
        improved_content: note.improved_content?.substring(0, 50) || 'none'
      },
      timestamps: {
        summary: note.summary_generated_at,
        keyPoints: note.key_points_generated_at,
        markdown: note.markdown_content_generated_at,
        improved: note.improved_content_generated_at
      }
    });

    setEnhancementState(newState);
  }, [noteId, validateContent]);

  const refreshEnhancementState = useCallback(async () => {
    console.log("🔄 Refreshing enhancement state for note:", noteId);
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('summary, key_points, markdown_content, improved_content, summary_generated_at, key_points_generated_at, markdown_content_generated_at, improved_content_generated_at')
        .eq('id', noteId)
        .single();

      if (error) {
        console.error("❌ Error refreshing enhancement state:", error);
        return;
      }

      if (data) {
        updateEnhancementState(data);
      }
    } catch (error) {
      console.error("❌ Exception in refreshEnhancementState:", error);
    }
  }, [noteId, updateEnhancementState]);

  useEffect(() => {
    refreshEnhancementState();
  }, [refreshEnhancementState]);

  return {
    enhancementState,
    updateEnhancementState,
    refreshEnhancementState
  };
};
