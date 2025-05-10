
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancementFunction } from './types';

export function useEnrichmentService() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);

  // Enrich note content using the edge function
  const enrichNote = async (
    noteId: string,
    noteContent: string,
    enhancementType: EnhancementFunction,
    userId: string | undefined,
    isFeatureEnabled: boolean,
    noteTitle?: string
  ) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to use this feature",
        variant: "destructive"
      });
      return null;
    }
    
    if (!isFeatureEnabled) {
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
      
      return result;
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

  return {
    enrichNote,
    isLoading,
    enhancedContent,
    setEnhancedContent
  };
}
