
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check notification system health
    const { data: pendingCount, error: pendingError } = await supabase
      .from('reminders')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .lte('reminder_time', new Date().toISOString());
    
    const { data: totalCount, error: totalError } = await supabase
      .from('reminders')
      .select('id', { count: 'exact' })
      .in('status', ['pending', 'sent']);
    
    const { data: digestUsers, error: digestError } = await supabase
      .rpc('get_digest_users');
    
    if (pendingError || totalError || digestError) {
      throw new Error('Health check failed');
    }
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        pending_notifications: pendingCount?.length || 0,
        total_active_notifications: totalCount?.length || 0,
        users_ready_for_digest: digestUsers?.length || 0
      },
      system: {
        database: 'connected',
        email_service: Deno.env.get('RESEND_API_KEY') ? 'configured' : 'missing',
        functions: 'operational'
      }
    };
    
    console.log('✅ Health check passed:', health);
    
    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
