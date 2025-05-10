
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancementFunction } from './types';
import { toast } from 'sonner';

export function useEnrichmentService() {
  const { toast: shadowToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      toast("Authentication required", {
        description: "Please log in to use this feature",
        variant: "destructive"
      });
      return null;
    }
    
    if (!isFeatureEnabled) {
      toast("Feature not available", {
        description: "Note enrichment is not available for your tier",
        variant: "destructive"
      });
      return null;
    }
    
    if (!noteContent || noteContent.trim().length < 10) {
      toast("Content too short", {
        description: "Please add more content to enhance"
      });
      return null;
    }
    
    setIsLoading(true);
    setEnhancedContent(null);
    setError(null);
    
    try {
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication failed');
      }
      
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://zuhcmwujzfddmafozubd.supabase.co'}/functions/v1/enrich-note`;
      console.log("Calling edge function at:", apiUrl);
      
      // Call the edge function
      const response = await fetch(apiUrl, {
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
      
      console.log("Edge function response status:", response.status);
      
      // Check response status before trying to parse
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
      // Handle non-JSON responses or network errors
      let result;
      try {
        result = await response.json();
        console.log("Edge function response:", result);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server. Please try again later.');
      }
      
      if (!result.enhancedContent) {
        throw new Error('No content received from the enhancement service');
      }
      
      setEnhancedContent(result.enhancedContent);
      
      return result;
    } catch (error) {
      console.error('Error enriching note:', error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      toast("Enhancement failed", {
        description: errorMessage
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
    error,
    setEnhancedContent,
    setError
  };
}
