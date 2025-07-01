
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
    
    console.log('Setting up reminder cron job...');
    
    // Set up cron job to run every 15 minutes
    const { data, error } = await supabase.rpc('setup_reminder_processing_cron', {
      job_name: 'process-reminders-job',
      schedule: '*/15 * * * *', // Every 15 minutes
      function_name: 'process-reminders'
    });
    
    if (error) {
      console.error('Error setting up cron job:', error);
      throw error;
    }
    
    console.log('Cron job setup result:', data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reminder cron job setup successfully",
        result: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in setup-reminder-cron function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
