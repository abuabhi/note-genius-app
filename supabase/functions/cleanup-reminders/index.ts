
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting automatic reminder cleanup...');
    
    // Get cleanup configuration
    const { data: config, error: configError } = await supabase
      .from('reminder_cleanup_config')
      .select('retention_days, auto_cleanup_enabled')
      .single();
    
    if (configError || !config?.auto_cleanup_enabled) {
      console.log('Cleanup disabled or config not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Cleanup disabled or configuration not found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Run the cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_old_reminders', {
        retention_days: config.retention_days
      });
    
    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
      throw cleanupError;
    }
    
    const result = cleanupResult[0];
    console.log('Cleanup completed:', result);
    
    // Update last cleanup timestamp
    await supabase
      .from('reminder_cleanup_config')
      .update({ last_cleanup_at: new Date().toISOString() })
      .eq('auto_cleanup_enabled', true);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cleanup completed successfully',
        result: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-reminders function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
