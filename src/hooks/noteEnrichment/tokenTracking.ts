
import { supabase } from "@/integrations/supabase/client";

/**
 * Track token usage for note enrichments
 */
export const trackTokenUsage = async (noteId: string, tokenUsage: { promptTokens: number; completionTokens: number }) => {
  try {
    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get the current authenticated user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found when tracking token usage');
      return;
    }
    
    // Insert usage record
    const { error } = await supabase
      .from('note_enrichment_usage')
      .insert({
        note_id: noteId,
        month_year: currentMonth,
        llm_provider: 'openai',
        prompt_tokens: tokenUsage.promptTokens,
        completion_tokens: tokenUsage.completionTokens,
        user_id: user.id
      });
    
    if (error) {
      console.error('Error tracking token usage:', error);
    }
  } catch (err) {
    console.error('Error tracking token usage:', err);
    // Don't re-throw - this should not block the main process
  }
};
