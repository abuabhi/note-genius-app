
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
    
    const processedIds: string[] = [];
    const failedIds: string[] = [];
    
    // Process each notification
    for (const notification of notifications) {
      try {
        const deliveryMethods = Array.isArray(notification.delivery_methods) 
          ? notification.delivery_methods 
          : ['in_app'];
        
        // Send email notifications if requested
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
    }
    
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
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
