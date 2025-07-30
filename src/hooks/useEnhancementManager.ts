import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancementResult {
  content: string;
  success: boolean;
  processingTime?: number;
  tokensUsed?: number;
}

export const useEnhancementManager = (note: Note, onNoteUpdate?: () => void) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});

  const updateNote = useCallback(async (updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', note.id);
      
      if (error) throw error;
      onNoteUpdate?.();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, [note.id, onNoteUpdate]);

  const saveToDatabase = useCallback(async (column: string, content: string, statusColumn?: string) => {
    try {
      const timestampColumnMap: { [key: string]: string } = {
        'summary': 'summary_generated_at',
        'key_points': 'key_points_generated_at',
        'markdown_content': 'markdown_content_generated_at',
        'enriched_content': 'enriched_content_generated_at',
        'questions_content': 'questions_generated_at'
      };

      const updates: any = {
        [column]: content,
        [timestampColumnMap[column] || `${column}_generated_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (statusColumn) {
        updates[statusColumn] = 'completed';
      }

      await updateNote(updates);
    } catch (error) {
      console.error('Database save failed:', error);
    }
  }, [updateNote]);

  const processEnhancementContent = useCallback((enhancementType: string, data: any): string => {
    switch (enhancementType) {
      case 'summary':
        if (data.summary_overview) {
          let content = `# ${data.summary_title || 'Summary'}\n\n${data.summary_overview}`;
          if (data.key_points && data.key_points.length > 0) {
            content += '\n\n## Key Points\n\n' + data.key_points.map((point: string) => `- ${point}`).join('\n');
          }
          if (data.quote_or_stat && data.quote_or_stat !== 'N/A') {
            content += `\n\n## Notable Quote\n\n> ${data.quote_or_stat}`;
          }
          return content;
        }
        break;
      case 'extract-key-points':
        if (data.key_points && Array.isArray(data.key_points)) {
          return data.key_points.map((point: string) => `• ${point}`).join('\n\n');
        }
        break;
      case 'generate-questions':
        if (data.questions && Array.isArray(data.questions)) {
          return data.questions.map((question: string, index: number) => `${index + 1}. ${question}`).join('\n\n');
        }
        break;
      default:
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }
    return JSON.stringify(data, null, 2);
  }, []);

  const generateEnhancement = useCallback(async (enhancementType: string, column: string, statusColumn?: string): Promise<EnhancementResult> => {
    const start = performance.now();
    setLoadingStates(prev => ({ ...prev, [enhancementType]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: {
          text: note.content || note.description || '',
          enhancementType
        }
      });

      const totalTime = performance.now() - start;

      if (error) {
        toast.error('Enhancement failed: ' + error.message);
        return { content: '', success: false };
      }

      if (!data.success) {
        toast.error('Enhancement failed: ' + data.error);
        return { content: '', success: false };
      }

      const processedContent = processEnhancementContent(enhancementType, data.result);
      
      // Immediate display
      setGeneratedContent(prev => ({ ...prev, [column]: processedContent }));
      
      // Background save
      setTimeout(() => saveToDatabase(column, processedContent, statusColumn), 0);
      
      toast.success(`Enhancement completed in ${(totalTime / 1000).toFixed(1)}s`);
      
      return {
        content: processedContent,
        success: true,
        processingTime: data.processing_time,
        tokensUsed: data.tokens_used
      };
    } catch (error) {
      const totalTime = performance.now() - start;
      toast.error('Request failed: ' + (error instanceof Error ? error.message : 'Network error'));
      return { content: '', success: false };
    } finally {
      setLoadingStates(prev => ({ ...prev, [enhancementType]: false }));
    }
  }, [note.content, note.description, processEnhancementContent, saveToDatabase]);

  const regenerateAll = useCallback(async (enhanceableItems: Array<{ enhancementType: string; column: string; statusColumn?: string }>) => {
    for (const item of enhanceableItems) {
      await generateEnhancement(item.enhancementType, item.column, item.statusColumn);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success('All enhancements regenerated successfully!');
  }, [generateEnhancement]);

  const isLoading = useCallback((enhancementType: string) => loadingStates[enhancementType] || false, [loadingStates]);
  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    generatedContent,
    generateEnhancement,
    regenerateAll,
    isLoading,
    isAnyLoading
  };
};