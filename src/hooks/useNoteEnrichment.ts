
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Note } from '@/types/note';
import { fetchNoteEnrichmentUsage, updateNoteInDatabase } from '@/contexts/notes/noteOperations';
import { enrichNote } from './noteEnrichment/enrichmentService';

export type EnhancementFunction = 
  | 'summarize' 
  | 'extract-key-points' 
  | 'generate-questions' 
  | 'improve-clarity' 
  | 'convert-to-markdown'
  | 'fix-spelling-grammar';

export interface EnhancementOption {
  id: EnhancementFunction;
  name: string;
  description: string;
  icon: string;
}

export const useNoteEnrichment = (note: Note) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementFunction | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ current: number, limit: number | null }>({ current: 0, limit: null });
  const { toast } = useToast();

  const enhancementOptions: EnhancementOption[] = [
    {
      id: 'summarize',
      name: 'Summarize',
      description: 'Create a concise summary of your note',
      icon: 'FileText'
    },
    {
      id: 'extract-key-points',
      name: 'Extract Key Points',
      description: 'Extract the main points from your note',
      icon: 'ListChecks'
    },
    {
      id: 'generate-questions',
      name: 'Generate Questions',
      description: 'Create study questions based on your note',
      icon: 'HelpCircle'
    },
    {
      id: 'improve-clarity',
      name: 'Improve Clarity',
      description: 'Rewrite your note for better clarity and readability',
      icon: 'Lightbulb'
    },
    {
      id: 'convert-to-markdown',
      name: 'Convert to Markdown',
      description: 'Format your note with Markdown styling',
      icon: 'FileSymlink'
    },
    {
      id: 'fix-spelling-grammar',
      name: 'Fix Spelling & Grammar',
      description: 'Correct spelling and grammar errors',
      icon: 'Pencil'
    }
  ];

  const checkUsage = async () => {
    try {
      const usageData = await fetchNoteEnrichmentUsage();
      setUsage(usageData);
      return usageData;
    } catch (error) {
      console.error('Error checking usage:', error);
      return { current: 0, limit: null };
    }
  };

  const hasReachedLimit = () => {
    return usage.limit !== null && usage.current >= usage.limit;
  };

  const processEnhancement = async (enhancementType: EnhancementFunction): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Check if user has reached their limit
      const currentUsage = await checkUsage();
      if (currentUsage.limit !== null && currentUsage.current >= currentUsage.limit) {
        setError('You have reached your monthly enhancement limit.');
        toast({
          title: "Enhancement limit reached",
          description: "You have reached your monthly note enhancement limit.",
          variant: "destructive",
        });
        return false;
      }
      
      // Process the enhancement
      const result = await enrichNote(note, enhancementType);
      setEnhancedContent(result);
      
      toast({
        title: "Note enhanced",
        description: "Your note has been enhanced successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error during note enrichment:', error);
      setError('An error occurred during enhancement. Please try again later.');
      
      toast({
        title: "Enhancement failed",
        description: "There was a problem enhancing your note.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const applyEnhancement = async (): Promise<boolean> => {
    try {
      if (!enhancedContent || !note.id) return false;
      
      await updateNoteInDatabase(note.id, { 
        content: enhancedContent 
      });
      
      toast({
        title: "Enhancement applied",
        description: "The enhancement has been applied to your note.",
      });
      
      return true;
    } catch (error) {
      console.error('Error applying enhancement:', error);
      
      toast({
        title: "Failed to apply enhancement",
        description: "There was a problem updating your note.",
        variant: "destructive",
      });
      
      return false;
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
    usage,
    hasReachedLimit,
    checkUsage
  };
};
