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
    
    console.log('🔧 Setting up notification and digest system...');
    
    const results = [];
    
    // Step 1: Setup digest cron
    try {
      console.log('📧 Setting up digest cron...');
      const { data: digestSetup, error: digestError } = await supabase.functions.invoke('setup-digest-cron');
      
      if (digestError) {
        throw digestError;
      }
      
      results.push({ step: 'digest-cron', success: true, result: digestSetup });
      console.log('✅ Digest cron setup complete');
    } catch (error) {
      console.error('❌ Digest cron setup failed:', error);
      results.push({ step: 'digest-cron', success: false, error: error.message });
    }
    
    // Step 2: Setup reminder cron
    try {
      console.log('🔔 Setting up reminder cron...');
      const { data: reminderSetup, error: reminderError } = await supabase.functions.invoke('setup-reminder-cron');
      
      if (reminderError) {
        throw reminderError;
      }
      
      results.push({ step: 'reminder-cron', success: true, result: reminderSetup });
      console.log('✅ Reminder cron setup complete');
    } catch (error) {
      console.error('❌ Reminder cron setup failed:', error);
      results.push({ step: 'reminder-cron', success: false, error: error.message });
    }
    
    // Step 3: Setup cleanup cron
    try {
      console.log('🧹 Setting up cleanup cron...');
      const { data: cleanupSetup, error: cleanupError } = await supabase.functions.invoke('setup-cleanup-cron');
      
      if (cleanupError) {
        throw cleanupError;
      }
      
      results.push({ step: 'cleanup-cron', success: true, result: cleanupSetup });
      console.log('✅ Cleanup cron setup complete');
    } catch (error) {
      console.error('❌ Cleanup cron setup failed:', error);
      results.push({ step: 'cleanup-cron', success: false, error: error.message });
    }
    
    // Step 4: Verify system health
    try {
      console.log('🏥 Checking system health...');
      const { data: health, error: healthError } = await supabase.functions.invoke('reminder-system-health');
      
      if (healthError) {
        throw healthError;
      }
      
      results.push({ step: 'health-check', success: true, result: health });
      console.log('✅ System health check complete');
    } catch (error) {
      console.error('❌ Health check failed:', error);
      results.push({ step: 'health-check', success: false, error: error.message });
    }
    
    const successCount = results.filter(r => r.success).length;
    const totalSteps = results.length;
    
    console.log(`🎉 Setup complete: ${successCount}/${totalSteps} steps successful`);
    
    return new Response(JSON.stringify({
      success: successCount === totalSteps,
      completed: successCount,
      total: totalSteps,
      results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Setup system error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});