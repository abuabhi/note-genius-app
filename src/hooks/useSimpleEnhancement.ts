import { useState } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSimpleEnhancement = (note: Note, onNoteUpdate?: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceNote = async (enhancementType: string) => {
    setIsEnhancing(true);
    
    try {
      const noteContent = note.content || note.description || '';
      
      // Use enrich-note function for enrichment requests to handle large content with chunking
      if (enhancementType === 'enrich-note') {
        const { data, error } = await supabase.functions.invoke('enrich-note', {
          body: {
            noteId: note.id,
            noteContent,
            enhancementType,
            noteTitle: note.title || 'Untitled Note'
          }
        });

        if (error) throw error;
        if (!data.enhancedContent) throw new Error('Enhancement failed - no content returned');

        toast.success('Note enrichment completed successfully!');
        
        if (onNoteUpdate) {
          onNoteUpdate();
        }
        
        return data.enhancedContent;
      } else {
        // Use test-enhance for other enhancement types
        const { data, error } = await supabase.functions.invoke('test-enhance', {
          body: {
            text: noteContent,
            enhancementType
          }
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        toast.success(`${enhancementType.replace('-', ' ')} completed successfully!`);
        
        if (onNoteUpdate) {
          onNoteUpdate();
        }
        
        return data.result;
      }
    } catch (error) {
      console.error(`Error generating ${enhancementType}:`, error);
      toast.error(`Failed to generate ${enhancementType.replace('-', ' ')}`);
      throw error;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    enhanceNote,
    isEnhancing
  };
};