
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current time info
    const now = new Date();
    const utcNow = now.toISOString();
    const today = now.toISOString().split('T')[0];
    const aestNow = now.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
    
    // Get user's reminders
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true });
    
    if (remindersError) {
      throw remindersError;
    }
    
    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    const debugInfo = {
      currentTime: {
        utc: utcNow,
        aest: aestNow,
        todayDate: today
      },
      user: {
        id: userId,
        email: user?.email || 'Not found',
        hasUser: !!user
      },
      reminders: {
        total: reminders?.length || 0,
        pending: reminders?.filter(r => r.status === 'pending').length || 0,
        sent: reminders?.filter(r => r.status === 'sent').length || 0,
        cancelled: reminders?.filter(r => r.status === 'cancelled').length || 0
      },
      upcomingReminders: reminders
        ?.filter(r => r.status === 'pending' && r.reminder_time)
        ?.map(r => ({
          id: r.id,
          title: r.title,
          reminder_time: r.reminder_time,
          due_date: r.due_date,
          type: r.type,
          delivery_methods: r.delivery_methods,
          priority: r.priority,
          isDue: new Date(r.reminder_time) <= now,
          minutesUntilDue: Math.round((new Date(r.reminder_time).getTime() - now.getTime()) / (1000 * 60))
        }))
        ?.slice(0, 10) || [],
      overdueReminders: reminders
        ?.filter(r => r.status === 'pending' && r.reminder_time && new Date(r.reminder_time) < now)
        ?.map(r => ({
          id: r.id,
          title: r.title,
          reminder_time: r.reminder_time,
          minutesOverdue: Math.round((now.getTime() - new Date(r.reminder_time).getTime()) / (1000 * 60))
        })) || []
    };
    
    return new Response(
      JSON.stringify(debugInfo, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Debug reminders error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
