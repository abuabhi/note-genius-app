
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
    
    console.log('Setting up cleanup cron job...');
    
    // Set up cron job to run cleanup daily at 2 AM UTC
    const { data, error } = await supabase.rpc('setup_cleanup_cron', {
      job_name: 'cleanup-reminders-job',
      schedule: '0 2 * * *', // Daily at 2 AM UTC
      function_name: 'cleanup-reminders'
    });
    
    if (error) {
      console.error('Error setting up cleanup cron job:', error);
      throw error;
    }
    
    console.log('Cleanup cron job setup result:', data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cleanup cron job setup successfully",
        result: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in setup-cleanup-cron function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
