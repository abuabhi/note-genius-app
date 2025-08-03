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
    
    // Get the raw result
    const rawResult = data && typeof data === 'object' && data.result ? data.result : data;
    
    // Special handling for summary enhancement type
    if (enhancementType === 'summary' && typeof rawResult === 'string') {
      try {
        const summaryData = JSON.parse(rawResult);
        
        // Format summary JSON into readable HTML
        let formattedHtml = '';
        
        if (summaryData.summary_title) {
          formattedHtml += `<h2>${summaryData.summary_title}</h2>`;
        }
        
        if (summaryData.summary_overview) {
          formattedHtml += `<p>${summaryData.summary_overview}</p>`;
        }
        
        if (summaryData.key_points && Array.isArray(summaryData.key_points)) {
          formattedHtml += '<h3>Key Points</h3><ul>';
          summaryData.key_points.forEach((point: string) => {
            formattedHtml += `<li>${point}</li>`;
          });
          formattedHtml += '</ul>';
        }
        
        if (summaryData.notable_terms && Array.isArray(summaryData.notable_terms)) {
          formattedHtml += '<h3>Notable Terms</h3><dl>';
          summaryData.notable_terms.forEach((term: any) => {
            if (typeof term === 'object' && term.term && term.definition) {
              formattedHtml += `<dt><strong>${term.term}</strong></dt><dd>${term.definition}</dd>`;
            }
          });
          formattedHtml += '</dl>';
        }
        
        if (summaryData.quote_or_stat) {
          formattedHtml += `<blockquote><p><em>${summaryData.quote_or_stat}</em></p></blockquote>`;
        }
        
        console.log("🚀 FORMATTED SUMMARY HTML:", formattedHtml);
        return formattedHtml;
      } catch (error) {
        console.log("🚀 Failed to parse summary JSON, returning raw:", rawResult);
        // Fallback to raw content if JSON parsing fails
        return typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult, null, 2);
      }
    }
    
    // For non-summary types, return raw content
    console.log("🚀 RETURNING RAW RESULT:", rawResult);
    return typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult, null, 2);
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