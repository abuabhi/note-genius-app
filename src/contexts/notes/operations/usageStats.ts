
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches note enrichment usage data for a specified month
 */
export const fetchNoteEnrichmentUsage = async (monthYear: string) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('No authenticated user');
    }
    
    const { data, error } = await supabase
      .from('note_enrichment_usage')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('month_year', monthYear);
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching note enrichment usage:', error);
    return [];
  }
};
