
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEnhancementProcessor = (note: Note) => {
  const { updateNote } = useOptimizedNotes();
  const [isProcessing, setIsProcessing] = useState(false);

  const processEnhancement = useCallback(async (
    enhancementType: string, 
    content: string
  ) => {
    setIsProcessing(true);
    
    try {
      // Update the note with the enhanced content
      const updateData: Partial<Note> = {
        [`${enhancementType}_content`]: content,
        [`${enhancementType}_generated_at`]: new Date().toISOString()
      };

      await updateNote(note.id, updateData);
      toast.success('Enhancement applied successfully!');
      
      return { success: true, content };
    } catch (error) {
      console.error('Error processing enhancement:', error);
      toast.error('Failed to apply enhancement');
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, [note.id, updateNote]);

  return {
    processEnhancement,
    isProcessing
  };
};
