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
      const originalWordCount = noteContent.split(/\s+/).length;
      console.log(`🔍 [Enhancement Debug] Starting enhancement:`, {
        type: enhancementType,
        originalLength: noteContent.length,
        originalWordCount,
        noteId: note.id,
        functionChoice: enhancementType === 'enrich-note' ? 'enrich-note' : 'test-enhance'
      });
      
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

        const enhancedWordCount = data.enhancedContent.split(/\s+/).length;
        const hasEnrichedTags = /\[(?:AI_)?ENRICHED\]/i.test(data.enhancedContent);
        
        console.log(`✅ [Enhancement Debug] Enrichment completed:`, {
          enhancedLength: data.enhancedContent.length,
          enhancedWordCount,
          wordCountIncrease: enhancedWordCount - originalWordCount,
          percentageIncrease: ((enhancedWordCount - originalWordCount) / originalWordCount * 100).toFixed(1) + '%',
          hasEnrichedTags
        });

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

        const resultWordCount = data.result.split(/\s+/).length;
        console.log(`✅ [Enhancement Debug] Enhancement completed:`, {
          type: enhancementType,
          resultLength: data.result.length,
          resultWordCount,
          wordCountChange: resultWordCount - originalWordCount
        });

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