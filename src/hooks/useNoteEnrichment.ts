import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { useUserTier } from '@/hooks/useUserTier';
import { updateNoteInDatabase } from '@/contexts/notes/operations';
import { enrichNote } from './noteEnrichment/enrichmentService';
import { enhancementOptions } from './noteEnrichment/enhancementOptions';
import { useUsageStats } from './noteEnrichment/useUsageStats';
import { EnhancementFunction, EnhancementOption } from './noteEnrichment/types';

export type { EnhancementFunction, EnhancementOption };

export function useNoteEnrichment() {
  const { userTier } = useUserTier();
  
  // Get the tier limits directly from the hook
  const { tierLimits } = useUserTier();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    currentUsage,
    monthlyLimit,
    fetchUsageStats,
    hasReachedLimit
  } = useUsageStats();
  
  const isEnabled = tierLimits?.note_enrichment_enabled || import.meta.env.DEV;

  // Initialize function to load usage data
  const initialize = async () => {
    await fetchUsageStats();
  };

  useEffect(() => {
    initialize();
  }, []);

  const processEnhancement = async (enhancementType: EnhancementFunction): Promise<boolean> => {
    try {
      console.log(`Processing enhancement with type: ${enhancementType}`);
      setIsProcessing(true);
      setIsLoading(true);
      setError(null);
      
      // Check if user has reached their limit
      const usage = await fetchUsageStats();
      if (hasReachedLimit(usage)) {
        setError('You have reached your monthly enhancement limit.');
        toast.error("Enhancement limit reached", {
          description: "You have reached your monthly note enhancement limit."
        });
        return false;
      }
      
      if (!note) {
        setError('No note provided for enhancement');
        return false;
      }
      
      // Process the enhancement
      const result = await enrichNote(note, enhancementType);
      console.log("Enhancement result received:", result.substring(0, 50) + "...");
      setEnhancedContent(result);
      
      toast.success("Note enhanced", {
        description: "Your note has been enhanced successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error during note enrichment:', error);
      setError('An error occurred during enhancement. Please try again later.');
      
      toast.error("Enhancement failed", {
        description: "There was a problem enhancing your note."
      });
      
      return false;
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const applyEnhancement = async (): Promise<boolean> => {
    try {
      if (!enhancedContent || !note?.id) return false;
      
      await updateNoteInDatabase(note.id, { 
        content: enhancedContent 
      });
      
      toast.success("Enhancement applied", {
        description: "The enhancement has been applied to your note."
      });
      
      return true;
    } catch (error) {
      console.error('Error applying enhancement:', error);
      
      toast.error("Failed to apply enhancement", {
        description: "There was a problem updating your note."
      });
      
      return false;
    }
  };

  // Function to handle note enrichment directly (used by CreateNoteForm)
  const enrichNoteDirectly = async (
    noteId: string,
    content: string,
    enhancementType: EnhancementFunction,
    title: string
  ) => {
    try {
      setIsLoading(true);
      
      if (!isEnabled) {
        console.log("Note enrichment is not enabled for this user tier");
        return null;
      }
      
      const mockNote: Note = {
        id: noteId,
        title: title,
        content: content,
        description: "",
        date: new Date().toISOString().split('T')[0],
        category: "General",
        sourceType: "manual" // Explicitly using the literal "manual" type
      };
      
      const result = await enrichNote(mockNote, enhancementType);
      return result;
    } catch (error) {
      console.error("Error enriching note directly:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isProcessing,
    enhancedContent,
    error,
    selectedEnhancement,
    setSelectedEnhancement,
    enhancementOptions,
    processEnhancement,
    applyEnhancement,
    usage: { current: currentUsage, limit: monthlyLimit },
    hasReachedLimit: () => hasReachedLimit({ current: currentUsage, limit: monthlyLimit }),
    checkUsage: fetchUsageStats,
    isLoading,
    currentUsage,
    monthlyLimit,
    isEnabled,
    initialize,
    setEnhancedContent,
    enrichNote: enrichNoteDirectly
  };
};

// Re-export for convenience
export { enhancementOptions };
