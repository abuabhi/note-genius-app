
import { useState } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAIRequestGuard } from '@/hooks/useAIRequestGuard';

export const useSimpleEnhancement = (note: Note, onNoteUpdate?: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const guardAIRequest = useAIRequestGuard();

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
      
      if (enhancementType === 'enrich-note') {
        const { data, error } = await guardAIRequest(
          `enrich-note:${note.id}:${enhancementType}`,
          () => supabase.functions.invoke('enrich-note', {
            body: {
              noteId: note.id,
              noteContent,
              enhancementType,
              noteTitle: note.title || 'Untitled Note'
            }
          })
        );

        if (error) {
          console.error('❌ enrich-note error:', error);
          // Try to parse limit error details
          let parsed: any = null;
          try { parsed = JSON.parse(error.message); } catch (_) {}
          if (parsed?.error === 'usage_limit_reached') {
            toast.error(parsed.message || "You've reached your monthly AI enrichment limit.");
          } else {
            toast.error('Failed to enrich note');
          }
          throw error;
        }

        if (!data?.enhancedContent) {
          throw new Error('Enhancement failed - no content returned');
        }

        const enhancedWordCount = data.enhancedContent.split(/\s+/).length;
        const hasEnrichedTags = /\[(?:AI_)?ENRICHED\]/i.test(data.enhancedContent);
        
        console.log(`✅ [Enhancement Debug] Enrichment completed:`, {
          enhancedLength: data.enhancedContent.length,
          enhancedWordCount,
          wordCountIncrease: enhancedWordCount - originalWordCount,
          percentageIncrease: ((enhancedWordCount - originalWordCount) / originalWordCount * 100).toFixed(1) + '%',
          hasEnrichedTags,
          usage: data.usage
        });

        toast.success('Note enrichment completed successfully!');
        // Surface usage progress if available
        if (data?.usage?.used != null && data?.usage?.limit != null) {
          toast.message(`AI Enrichment usage: ${data.usage.used} / ${data.usage.limit}`, {
            description: `Remaining this month: ${Math.max(0, (data.usage.limit - data.usage.used))}`,
          });
        }
        
        if (onNoteUpdate) {
          onNoteUpdate();
        }
        
        return data.enhancedContent;
      } else {
        // Use test-enhance for other enhancement types (guarded)
        const { data, error } = await guardAIRequest(
          `test-enhance:${note.id}:${enhancementType}`,
          () => supabase.functions.invoke('test-enhance', {
            body: {
              text: noteContent,
              enhancementType
            }
          })
        );

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
