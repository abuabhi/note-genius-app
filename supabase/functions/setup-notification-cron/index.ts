
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
    
    // Prefer safe, parameterized RPCs/edge functions over raw SQL
    const [digestSetup, reminderSetup] = await Promise.allSettled([
      supabase.functions.invoke('setup-digest-cron'),
      supabase.functions.invoke('setup-reminder-cron')
    ]);

    const jobs: string[] = [];
    if (digestSetup.status === 'fulfilled') jobs.push('daily-digest-hourly: 0 * * * * (every hour)');
    if (reminderSetup.status === 'fulfilled') jobs.push('process-reminders-job: */15 * * * * (every 15 minutes)');

    console.log('✅ Cron jobs configured via setup functions', { digest: digestSetup.status, reminder: reminderSetup.status });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Notification cron jobs configured',
      jobs
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
