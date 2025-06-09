
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
    // CRITICAL FIX: Don't treat 'generating' or 'pending' status as having content
    const summaryStatus = note.summary_status || 'completed';
    const hasSummaryContent = validateContent(note.summary) && summaryStatus === 'completed';
    
    const newState = {
      hasSummary: hasSummaryContent,
      hasKeyPoints: validateContent(note.key_points),
      hasMarkdown: validateContent(note.markdown_content),
      hasImprovedClarity: validateContent(note.improved_content, 20), // Higher threshold for improved content
      isLoading: false
    };

    console.log("🔄 Enhancement state updated:", {
      noteId,
      newState,
      summaryStatus,
      rawContentLengths: {
        summary: note.summary?.length || 0,
        key_points: note.key_points?.length || 0,
        markdown_content: note.markdown_content?.length || 0,
        improved_content: note.improved_content?.length || 0
      },
      summaryValidation: {
        hasContent: !!note.summary,
        hasValidLength: validateContent(note.summary),
        statusIsCompleted: summaryStatus === 'completed',
        finalResult: hasSummaryContent
      }
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
        // Type the data properly to match Note interface
        const noteData: Partial<Note> = {
          summary: data.summary,
          summary_status: data.summary_status as 'pending' | 'generating' | 'completed' | 'failed',
          key_points: data.key_points,
          markdown_content: data.markdown_content,
          improved_content: data.improved_content,
          summary_generated_at: data.summary_generated_at,
          key_points_generated_at: data.key_points_generated_at,
          markdown_content_generated_at: data.markdown_content_generated_at,
          improved_content_generated_at: data.improved_content_generated_at
        };
        
        updateEnhancementState(noteData);
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
