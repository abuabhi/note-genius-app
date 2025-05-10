
import { supabase } from "@/integrations/supabase/client";

// Get the current usage statistics for note enrichments
export const fetchNoteEnrichmentUsage = async (): Promise<{ current: number, limit: number | null }> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    
    // Get user tier first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_tier')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
      
    if (profileError) throw profileError;
    
    // Get tier limits
    const { data: tierLimits, error: tierError } = await supabase
      .from('tier_limits')
      .select('note_enrichment_limit_per_month')
      .eq('tier', profileData.user_tier)
      .single();
      
    if (tierError) throw tierError;
    
    // Get current usage
    const { data: usageData, error: usageError } = await supabase
      .from('note_enrichment_usage')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('month_year', currentMonth);
      
    if (usageError) throw usageError;
    
    return {
      current: usageData.length,
      limit: tierLimits.note_enrichment_limit_per_month
    };
  } catch (error) {
    console.error('Error fetching note enrichment usage:', error);
    return { current: 0, limit: null };
  }
};
