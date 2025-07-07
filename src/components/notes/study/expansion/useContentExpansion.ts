import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContentExpansion {
  id: string;
  originalText: string;
  expandedContent: string;
  position: number;
  timestamp: Date;
}

export const useContentExpansion = (noteContent: string, contentType: string, noteTitle?: string) => {
  const [expansions, setExpansions] = useState<ContentExpansion[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);

  const expandContent = useCallback(async (selectedText: string, selectionPosition: number) => {
    setIsExpanding(true);
    
    try {
      console.log('🚀 Starting content expansion:', {
        selectedText: selectedText.substring(0, 50),
        selectionPosition,
        contentType
      });

      const { data, error } = await supabase.functions.invoke('expand-content', {
        body: {
          selectedText,
          fullContext: noteContent,
          contentType,
          noteTitle
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to expand content');
      }

      const newExpansion: ContentExpansion = {
        id: crypto.randomUUID(),
        originalText: selectedText,
        expandedContent: data.expandedContent,
        position: selectionPosition,
        timestamp: new Date()
      };

      setExpansions(prev => [...prev, newExpansion]);
      toast.success('Content expanded successfully!');
      
      console.log('✅ Content expansion completed:', newExpansion);

    } catch (error) {
      console.error('❌ Content expansion failed:', error);
      toast.error('Failed to expand content. Please try again.');
    } finally {
      setIsExpanding(false);
    }
  }, [noteContent, contentType, noteTitle]);

  const removeExpansion = useCallback((expansionId: string) => {
    setExpansions(prev => prev.filter(exp => exp.id !== expansionId));
    toast.success('Expansion removed');
  }, []);

  const clearAllExpansions = useCallback(() => {
    setExpansions([]);
    toast.success('All expansions cleared');
  }, []);

  return {
    expansions,
    isExpanding,
    expandContent,
    removeExpansion,
    clearAllExpansions
  };
};