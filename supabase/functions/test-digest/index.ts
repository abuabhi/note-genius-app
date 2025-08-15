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
    
    console.log('🧪 Testing notification and email systems...');
    
    // Test 1: Check cron extensions
    const { data: extensions } = await supabase
      .from('pg_extension')
      .select('extname')
      .in('extname', ['pg_cron', 'pg_net']);
    
    console.log('📋 Database extensions:', extensions);
    
    // Test 2: Manual digest send
    console.log('📧 Testing digest email send...');
    const { data: digestResult, error: digestError } = await supabase.functions.invoke('send-daily-digest');
    
    if (digestError) {
      console.error('❌ Digest test failed:', digestError);
    } else {
      console.log('✅ Digest test result:', digestResult);
    }
    
    // Test 3: Manual reminder processing
    console.log('🔄 Testing reminder processing...');
    const { data: reminderResult, error: reminderError } = await supabase.functions.invoke('process-reminders');
    
    if (reminderError) {
      console.error('❌ Reminder processing test failed:', reminderError);
    } else {
      console.log('✅ Reminder processing test result:', reminderResult);
    }
    
    // Test 4: Check system health
    console.log('🏥 Testing system health...');
    const { data: healthResult, error: healthError } = await supabase.functions.invoke('reminder-system-health');
    
    if (healthError) {
      console.error('❌ Health check failed:', healthError);
    } else {
      console.log('✅ System health:', healthResult);
    }
    
    // Test 5: Create a test reminder for current user
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        console.log('👤 Creating test reminder for user:', user.id);
        
        const testReminder = {
          user_id: user.id,
          title: 'Test Reminder - System Check',
          description: 'This is a test reminder to verify the notification system is working.',
          reminder_time: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
          type: 'study_event',
          status: 'pending',
          priority: 'medium',
          delivery_methods: ['in_app'],
          recurrence: 'none'
        };
        
        const { data: reminderData, error: reminderInsertError } = await supabase
          .from('reminders')
          .insert(testReminder)
          .select()
          .single();
        
        if (reminderInsertError) {
          console.error('❌ Failed to create test reminder:', reminderInsertError);
        } else {
          console.log('✅ Test reminder created:', reminderData.id);
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      tests: {
        extensions,
        digestResult,
        reminderResult,
        healthResult
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Test function error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});