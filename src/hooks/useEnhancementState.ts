
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

  // Enhanced validation with minimum length requirements
  const validateContent = useCallback((content: string | null | undefined, minLength: number = 10): boolean => {
    return Boolean(
      content && 
      typeof content === 'string' && 
      content.trim().length > minLength
    );
  }, []);

  const updateEnhancementState = useCallback((note: Partial<Note>) => {
    const newState = {
      hasSummary: validateContent(note.summary),
      hasKeyPoints: validateContent(note.key_points),
      hasMarkdown: validateContent(note.markdown_content),
      hasImprovedClarity: validateContent(note.improved_content, 20), // Higher threshold for improved content
      isLoading: false
    };

    console.log("🔄 Enhancement state updated:", {
      noteId,
      newState,
      rawContentLengths: {
        summary: note.summary?.length || 0,
        key_points: note.key_points?.length || 0,
        markdown_content: note.markdown_content?.length || 0,
        improved_content: note.improved_content?.length || 0
      },
      summaryStatus: note.summary_status
    });

    setEnhancementState(newState);
  }, [noteId, validateContent]);

  const refreshEnhancementState = useCallback(async () => {
    console.log("🔄 Refreshing enhancement state for note:", noteId);
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('summary, summary_status, key_points, markdown_content, improved_content, summary_generated_at, key_points_generated_at, markdown_content_generated_at, improved_content_generated_at')
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
