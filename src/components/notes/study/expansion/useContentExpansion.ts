import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContentExpansion {
  id: string;
  originalText: string;
  expandedContent: string;
  positionMarker: string;
  timestamp: Date;
  saved?: boolean; // Whether it's saved to database
}

export interface PendingExpansion {
  originalText: string;
  expandedContent: string;
  selectionPosition: number;
}

export const useContentExpansion = (noteId: string, noteContent: string, contentType: string, noteTitle?: string) => {
  // State keyed by noteId-contentType for complete isolation
  const stateKey = `${noteId}-${contentType}`;
  const [expansions, setExpansions] = useState<Map<string, ContentExpansion[]>>(new Map());
  const [pendingExpansion, setPendingExpansion] = useState<PendingExpansion | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load saved expansions from database on mount
  useEffect(() => {
    if (noteId) {
      loadSavedExpansions();
    }
  }, [noteId, contentType]);

  const loadSavedExpansions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('note_content_expansions')
        .select('*')
        .eq('note_id', noteId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const savedExpansions: ContentExpansion[] = data.map(item => ({
        id: item.id,
        originalText: item.original_text,
        expandedContent: item.expanded_content,
        positionMarker: item.position_marker,
        timestamp: new Date(item.created_at),
        saved: true
      }));

      setExpansions(prev => {
        const newMap = new Map(prev);
        newMap.set(stateKey, savedExpansions);
        return newMap;
      });

      console.log('✅ Loaded saved expansions:', savedExpansions.length);
    } catch (error) {
      console.error('❌ Failed to load saved expansions:', error);
    }
  }, [noteId, contentType, stateKey]);

  const expandContent = useCallback(async (selectedText: string, selectionPosition: number) => {
    setIsExpanding(true);
    
    try {
      console.log('🚀 Starting content expansion:', {
        selectedText: selectedText.substring(0, 50),
        selectionPosition,
        contentType,
        noteId
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

      // Set pending expansion for preview dialog
      setPendingExpansion({
        originalText: selectedText,
        expandedContent: data.expandedContent,
        selectionPosition
      });
      
      console.log('✅ Content expansion generated for preview');

    } catch (error) {
      console.error('❌ Content expansion failed:', error);
      toast.error('Failed to expand content. Please try again.');
    } finally {
      setIsExpanding(false);
    }
  }, [noteContent, contentType, noteTitle, noteId]);

  const regenerateExpansion = useCallback(async () => {
    if (!pendingExpansion) return;
    
    setIsRegenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('expand-content', {
        body: {
          selectedText: pendingExpansion.originalText,
          fullContext: noteContent,
          contentType,
          noteTitle
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to regenerate content');

      setPendingExpansion(prev => prev ? {
        ...prev,
        expandedContent: data.expandedContent
      } : null);

      console.log('✅ Content expansion regenerated');
    } catch (error) {
      console.error('❌ Regeneration failed:', error);
      toast.error('Failed to regenerate content. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [pendingExpansion, noteContent, contentType, noteTitle]);

  const confirmExpansion = useCallback(async () => {
    if (!pendingExpansion) return;

    try {
      // Create position marker from surrounding text
      const beforeText = noteContent.substring(Math.max(0, pendingExpansion.selectionPosition - 50), pendingExpansion.selectionPosition);
      const afterText = noteContent.substring(pendingExpansion.selectionPosition + pendingExpansion.originalText.length, pendingExpansion.selectionPosition + pendingExpansion.originalText.length + 50);
      const positionMarker = `${beforeText}|${pendingExpansion.originalText}|${afterText}`;

      // Save to database
      const { data, error } = await supabase
        .from('note_content_expansions')
        .insert({
          note_id: noteId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content_type: contentType,
          original_text: pendingExpansion.originalText,
          expanded_content: pendingExpansion.expandedContent,
          position_marker: positionMarker
        })
        .select()
        .single();

      if (error) throw error;

      const newExpansion: ContentExpansion = {
        id: data.id,
        originalText: pendingExpansion.originalText,
        expandedContent: pendingExpansion.expandedContent,
        positionMarker,
        timestamp: new Date(data.created_at),
        saved: true
      };

      // Add to state
      setExpansions(prev => {
        const newMap = new Map(prev);
        const currentExpansions = newMap.get(stateKey) || [];
        newMap.set(stateKey, [...currentExpansions, newExpansion]);
        return newMap;
      });

      setPendingExpansion(null);
      toast.success('Expansion added to your note!');
      
      console.log('✅ Expansion confirmed and saved:', newExpansion);
    } catch (error) {
      console.error('❌ Failed to save expansion:', error);
      toast.error('Failed to save expansion. Please try again.');
    }
  }, [pendingExpansion, noteId, contentType, noteContent, stateKey]);

  const cancelExpansion = useCallback(() => {
    setPendingExpansion(null);
    console.log('❌ Expansion cancelled');
  }, []);

  const removeExpansion = useCallback(async (expansionId: string) => {
    try {
      // Remove from database if it's saved
      const currentExpansions = expansions.get(stateKey) || [];
      const expansionToRemove = currentExpansions.find(exp => exp.id === expansionId);
      
      if (expansionToRemove?.saved) {
        const { error } = await supabase
          .from('note_content_expansions')
          .delete()
          .eq('id', expansionId);
        
        if (error) throw error;
      }

      // Remove from state
      setExpansions(prev => {
        const newMap = new Map(prev);
        const filtered = currentExpansions.filter(exp => exp.id !== expansionId);
        newMap.set(stateKey, filtered);
        return newMap;
      });

      toast.success('Expansion removed');
    } catch (error) {
      console.error('❌ Failed to remove expansion:', error);
      toast.error('Failed to remove expansion. Please try again.');
    }
  }, [expansions, stateKey]);

  const clearAllExpansions = useCallback(async () => {
    try {
      // Remove all from database
      const { error } = await supabase
        .from('note_content_expansions')
        .delete()
        .eq('note_id', noteId)
        .eq('content_type', contentType);

      if (error) throw error;

      // Clear from state
      setExpansions(prev => {
        const newMap = new Map(prev);
        newMap.set(stateKey, []);
        return newMap;
      });

      toast.success('All expansions cleared');
    } catch (error) {
      console.error('❌ Failed to clear expansions:', error);
      toast.error('Failed to clear expansions. Please try again.');
    }
  }, [noteId, contentType, stateKey]);

  // Get current expansions for this tab
  const currentExpansions = expansions.get(stateKey) || [];

  return {
    expansions: currentExpansions,
    pendingExpansion,
    isExpanding,
    isRegenerating,
    expandContent,
    regenerateExpansion,
    confirmExpansion,
    cancelExpansion,
    removeExpansion,
    clearAllExpansions
  };
};