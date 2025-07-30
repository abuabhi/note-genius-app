import { useState } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSimpleEnhancement = (note: Note, onNoteUpdate?: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceNote = async (enhancementType: string) => {
    setIsEnhancing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: {
          text: note.content || note.description || '',
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