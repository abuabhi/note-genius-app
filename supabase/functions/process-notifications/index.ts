
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
    
    console.log('🔄 Starting notification processing...');
    
    // Get pending notifications in batches
    const { data: notifications, error: fetchError } = await supabase
      .rpc('get_pending_notifications', { batch_size: 50 });
    
    if (fetchError) {
      console.error('❌ Error fetching notifications:', fetchError);
      throw fetchError;
    }
    
    if (!notifications || notifications.length === 0) {
      console.log('✅ No pending notifications to process');
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0,
        message: 'No pending notifications'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📬 Processing ${notifications.length} notifications`);
    
    // Build user preference map to respect global notification settings
    const userIds = Array.from(new Set(notifications.map((n: any) => n.user_id)));
    const prefsMap = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: profiles, error: prefsError } = await supabase
        .from('profiles')
        .select('id, notification_preferences')
        .in('id', userIds as any);
      if (prefsError) {
        console.warn('⚠️ Could not load user notification preferences, proceeding with defaults:', prefsError);
      } else {
        for (const p of profiles || []) {
          prefsMap.set(p.id, p.notification_preferences || {});
        }
      }
    }

    const processedIds: string[] = [];
    const failedIds: string[] = [];

    // Helper to decide if notification should be delivered based on user prefs
    const shouldDeliver = (notification: any, userPrefs: any): boolean => {
      const prefs = userPrefs || {};
      // Quiet hours: skip delivery between 22:00 and 07:59 when enabled
      if (prefs.respectQuietHours) {
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 8) return false;
      }
      // Type gating
      const type = (notification.type || '').toLowerCase();
      if (type === 'todo' && prefs.studyReminders === false) return false;
      if (type === 'achievement' && prefs.achievements === false) return false;
      if ((type === 'streak' || type === 'streak_warning') && prefs.streakWarnings === false) return false;

      // Frequency-based gating (coarse):
      // 1: minimal (only critical/urgent), 2: normal, 3: frequent
      const freq = Number(prefs.frequency ?? 2);
      if (freq === 1) {
        const priority = (notification.priority || '').toLowerCase();
        if (!['urgent', 'critical', 'high'].includes(priority)) return false;
      }
      return true;
    };

    // Concurrency control for processing notifications at scale
    const CONCURRENCY = 10;
    let index = 0;
    const processOne = async (notification: any) => {
      try {
        const userPrefs = prefsMap.get(notification.user_id);
        if (!shouldDeliver(notification, userPrefs)) {
          console.log(`⏳ Deferred (quiet/type/frequency): ${notification.id}`);
          return; // do not mark as sent, will retry later
        }

        const deliveryMethods = Array.isArray(notification.delivery_methods)
          ? notification.delivery_methods
          : ['in_app'];

        if (deliveryMethods.includes('email')) {
          const { error: emailError } = await supabase.functions.invoke('send-notification', {
            body: {
              userId: notification.user_id,
              type: 'email',
              subject: `Reminder: ${notification.title}`,
              body: notification.description || notification.title,
              reminderData: {
                type: notification.type,
                priority: notification.priority
              }
            }
          });
          if (emailError) {
            console.error(`❌ Email failed for ${notification.id}:`, emailError);
          } else {
            console.log(`📧 Email sent for: ${notification.title}`);
          }
        }

        // In-app notifications are handled by marking as 'sent'
        processedIds.push(notification.id);
        console.log(`✅ Processed: ${notification.title}`);
      } catch (error) {
        console.error(`❌ Failed to process ${notification.id}:`, error);
        failedIds.push(notification.id);
      }
    };

    const workers: Promise<void>[] = [];
    while (index < notifications.length) {
      const batch = notifications.slice(index, index + CONCURRENCY);
      workers.push(Promise.allSettled(batch.map(processOne)).then(() => undefined));
      index += CONCURRENCY;
    }
    await Promise.all(workers);

    // Mark processed notifications as sent
    if (processedIds.length > 0) {
      const { data: updateCount, error: updateError } = await supabase
        .rpc('mark_notifications_sent', { notification_ids: processedIds });
      
      if (updateError) {
        console.error('❌ Error marking notifications as sent:', updateError);
      } else {
        console.log(`✅ Marked ${updateCount} notifications as sent`);
      }
    }
    
    const result = {
      success: true,
      total: notifications.length,
      processed: processedIds.length,
      failed: failedIds.length,
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 Processing complete:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Critical error in notification processing:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Notification processing failed',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
