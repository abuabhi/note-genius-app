
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Setting up cron jobs for daily digest...')

    // Create cron job that runs every hour to check for users who need digests
    const cronQuery = `
      SELECT cron.schedule(
        'daily-digest-hourly',
        '0 * * * *', -- Every hour at minute 0
        $$
        SELECT net.http_post(
          url := '${supabaseUrl}/functions/v1/send-daily-digest',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"source": "cron"}'::jsonb
        ) as request_id;
        $$
      );
    `

    const { data, error } = await supabase.rpc('exec_sql', { sql: cronQuery })

    if (error) {
      throw error
    }

    // Also set up auto-escalation cron job
    const escalationCronQuery = `
      SELECT cron.schedule(
        'auto-escalate-todos',
        '0 6 * * *', -- Daily at 6 AM UTC
        $$
        SELECT public.auto_escalate_overdue_todos();
        $$
      );
    `

    const { error: escalationError } = await supabase.rpc('exec_sql', { sql: escalationCronQuery })

    if (escalationError) {
      console.error('Error setting up escalation cron:', escalationError)
      // Don't fail the entire request for this
    }

    console.log('Cron jobs set up successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cron jobs for daily digest and auto-escalation have been set up',
        digestCron: 'daily-digest-hourly',
        escalationCron: 'auto-escalate-todos'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error setting up cron jobs:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to set up cron jobs' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
