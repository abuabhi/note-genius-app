
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';

export type EnhancementFunction = 
  | 'summarize' 
  | 'addKeyPoints' 
  | 'explainConcepts' 
  | 'suggestQuestions' 
  | 'addExamples'
  | 'improvePhrasing';

export interface EnhancementOption {
  id: EnhancementFunction;
  name: string;
  description: string;
  icon: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export const enhancementOptions: EnhancementOption[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Generate a concise summary of your note',
    icon: 'FileText'
  },
  {
    id: 'addKeyPoints',
    name: 'Key Points',
    description: 'Extract the most important points from your note',
    icon: 'ListChecks'
  },
  {
    id: 'explainConcepts',
    name: 'Explain Concepts',
    description: 'Identify and explain key concepts in your note',
    icon: 'Lightbulb'
  },
  {
    id: 'suggestQuestions',
    name: 'Generate Questions',
    description: 'Create study questions based on your note',
    icon: 'HelpCircle'
  },
  {
    id: 'addExamples',
    name: 'Add Examples',
    description: 'Provide examples to illustrate concepts in your note',
    icon: 'FileSymlink'
  },
  {
    id: 'improvePhrasing',
    name: 'Improve Writing',
    description: 'Enhance clarity and readability of your note',
    icon: 'Pencil'
  }
];

export const useNoteEnrichment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tierLimits } = useUserTier();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  const [lastTokenUsage, setLastTokenUsage] = useState<TokenUsage | null>(null);

  // Fetch current usage statistics
  const fetchUsageStats = async () => {
    if (!user) return;
    
    try {
      // Get current month in YYYY-MM format
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Fetch usage count for current month
      const { data, error } = await supabase
        .from('note_enrichment_usage')
        .select('id')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth);
      
      if (error) throw error;
      
      // Get monthly limit from tier_limits
      const { data: tierData, error: tierError } = await supabase
        .from('tier_limits')
        .select('note_enrichment_limit_per_month')
        .eq('tier', tierLimits?.user_tier || 'SCHOLAR')
        .single();
      
      if (tierError) throw tierError;
      
      setCurrentUsage(data.length);
      setMonthlyLimit(tierData.note_enrichment_limit_per_month);
      
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  // Enrich note content using the edge function
  const enrichNote = async (
    noteId: string, 
    noteContent: string, 
    enhancementType: EnhancementFunction,
    noteTitle?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use this feature",
        variant: "destructive"
      });
      return null;
    }
    
    if (!tierLimits?.note_enrichment_enabled) {
      toast({
        title: "Feature not available",
        description: "Note enrichment is not available for your tier",
        variant: "destructive"
      });
      return null;
    }
    
    setIsLoading(true);
    setEnhancedContent(null);
    
    try {
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication failed');
      }
      
      // Call the edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          noteId,
          noteContent,
          enhancementType,
          noteTitle
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to enrich note');
      }
      
      setEnhancedContent(result.enhancedContent);
      setLastTokenUsage(result.tokenUsage);
      
      // Refresh usage statistics
      await fetchUsageStats();
      
      return result.enhancedContent;
    } catch (error) {
      console.error('Error enriching note:', error);
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize by fetching current usage
  const initialize = async () => {
    await fetchUsageStats();
  };
  
  return {
    enrichNote,
    isLoading,
    enhancedContent,
    currentUsage,
    monthlyLimit,
    lastTokenUsage,
    isEnabled: tierLimits?.note_enrichment_enabled || false,
    initialize,
    enhancementOptions
  };
};
