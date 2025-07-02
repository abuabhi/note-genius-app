
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔧 Setting up notification cron jobs...');
    
    // Set up notification processing every 5 minutes
    const notificationCron = `
      SELECT cron.schedule(
        'process-notifications-every-5min',
        '*/5 * * * *',
        $$
        SELECT net.http_post(
          url := '${supabaseUrl}/functions/v1/process-notifications',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
          body := '{"source": "cron"}'::jsonb
        );
        $$
      );
    `;
    
    // Set up daily digest processing every hour
    const digestCron = `
      SELECT cron.schedule(
        'send-daily-digest-hourly',
        '0 * * * *',
        $$
        SELECT net.http_post(
          url := '${supabaseUrl}/functions/v1/send-daily-digest',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
          body := '{"source": "cron"}'::jsonb
        );
        $$
      );
    `;
    
    // Execute cron setup
    await supabase.rpc('exec', { sql: notificationCron });
    await supabase.rpc('exec', { sql: digestCron });
    
    console.log('✅ Cron jobs configured successfully');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Notification cron jobs configured',
      jobs: [
        'process-notifications-every-5min: */5 * * * * (every 5 minutes)',
        'send-daily-digest-hourly: 0 * * * * (every hour)'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error setting up cron jobs:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
