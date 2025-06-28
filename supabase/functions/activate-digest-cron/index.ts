
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

    console.log('Activating enhanced daily digest cron job...')

    // Enable required extensions
    const enableExtensions = `
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      CREATE EXTENSION IF NOT EXISTS pg_net;
    `

    const { error: extensionsError } = await supabase.rpc('exec_sql', { sql: enableExtensions })

    if (extensionsError) {
      console.error('Error enabling extensions:', extensionsError)
      // Don't fail completely as extensions might already be enabled
    }

    // Create enhanced cron job that runs every hour
    const cronQuery = `
      SELECT cron.schedule(
        'enhanced-daily-digest-hourly',
        '0 * * * *', -- Every hour at minute 0
        $$
        SELECT net.http_post(
          url := '${supabaseUrl}/functions/v1/send-daily-digest',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"source": "cron", "enhanced": true}'::jsonb
        ) as request_id;
        $$
      );
    `

    const { error: cronError } = await supabase.rpc('exec_sql', { sql: cronQuery })

    if (cronError) {
      throw cronError
    }

    // Also maintain the auto-escalation cron job
    const escalationCronQuery = `
      SELECT cron.schedule(
        'auto-escalate-todos-enhanced',
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

    console.log('Enhanced cron jobs activated successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Enhanced daily digest cron job has been activated',
        digestCron: 'enhanced-daily-digest-hourly',
        escalationCron: 'auto-escalate-todos-enhanced',
        schedule: 'Every hour at minute 0',
        features: [
          'Goals and tasks',
          'Recent notes',
          'Flashcard sets with review status',
          'Quiz results and scores',
          'Study sessions and quality metrics',
          'Study streaks and achievements',
          'AI-powered recommendations',
          'Customizable content limits',
          'User preference controls'
        ]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error activating enhanced cron jobs:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to activate enhanced cron jobs' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
