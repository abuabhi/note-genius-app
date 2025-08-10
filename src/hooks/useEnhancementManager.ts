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
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>(() => {
    // Initialize with existing database content so all tabs use processed content
    return {
      summary: note.summary || '',
      key_points: note.key_points || '',
      markdown_content: note.markdown_content || '',
      enriched_content: note.enriched_content || '',
      questions_content: note.questions_content || ''
    };
  });

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
    console.log("🚀 RAW AI CONTENT:", data);
    
    // Get the raw result - all enhancement types now return direct HTML/text content
    const rawResult = data && typeof data === 'object' && data.result ? data.result : data;
    
    console.log("🚀 RETURNING RAW RESULT:", rawResult);
    return typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult, null, 2);
  }, []);

  const generateEnhancement = useCallback(async (enhancementType: string, column: string, statusColumn?: string): Promise<EnhancementResult> => {
    const start = performance.now();
    setLoadingStates(prev => ({ ...prev, [enhancementType]: true }));
    
    try {
      const isEnrichFunction = enhancementType === 'enrich-note' || enhancementType === 'generate-questions';
      const functionName = isEnrichFunction ? 'enrich-note' : 'test-enhance';
      const requestBody = isEnrichFunction
        ? {
            noteId: note.id,
            noteContent: note.content || note.description || '',
            enhancementType,
            noteTitle: (note as any).title || undefined,
          }
        : {
            text: note.content || note.description || '',
            enhancementType,
          };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody,
      });

      const totalTime = performance.now() - start;

      if (error) {
        toast.error('Enhancement failed: ' + error.message);
        return { content: '', success: false };
      }

      if (!isEnrichFunction && !data.success) {
        toast.error('Enhancement failed: ' + data.error);
        return { content: '', success: false };
      }

      const processedContent = isEnrichFunction
        ? (typeof data?.enhancedContent === 'string' 
            ? data.enhancedContent 
            : processEnhancementContent(enhancementType, data?.enhancedContent))
        : processEnhancementContent(enhancementType, data?.result);
      
      // Immediate display
      setGeneratedContent(prev => ({ ...prev, [column]: processedContent }));
      
      // Background save
      setTimeout(() => saveToDatabase(column, processedContent, statusColumn), 0);
      
      toast.success(`Enhancement completed in ${(totalTime / 1000).toFixed(1)}s`);
      
      return {
        content: processedContent,
        success: true,
        processingTime: (data as any)?.processing_time,
        tokensUsed: (data as any)?.tokens_used,
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