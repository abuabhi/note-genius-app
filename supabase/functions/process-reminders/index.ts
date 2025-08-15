
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Processing reminders...');
    const now = new Date();
    
    // Get reminders that are due for processing
    const { data: dueReminders, error: fetchError } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .lte('reminder_time', now.toISOString())
      .order('reminder_time', { ascending: true })
      .limit(50); // Process in batches
    
    if (fetchError) {
      console.error('Error fetching due reminders:', fetchError);
      throw fetchError;
    }
    
    if (!dueReminders || dueReminders.length === 0) {
      console.log('No reminders due for processing');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No reminders due for processing',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${dueReminders.length} reminders to process`);
    let processed = 0;
    let failed = 0;
    
    for (const reminder of dueReminders) {
      try {
        console.log(`Processing reminder: ${reminder.id} - ${reminder.title}`);
        
        // Send notification for each delivery method
        const deliveryMethods = Array.isArray(reminder.delivery_methods) 
          ? reminder.delivery_methods 
          : ['in_app'];
        
        for (const method of deliveryMethods) {
          if (method === 'email') {
            // Send email notification
            const { error: emailError } = await supabase.functions.invoke('send-notification', {
              body: {
                userId: reminder.user_id,
                type: 'email',
                subject: `Reminder: ${reminder.title}`,
                body: reminder.description || `This is a reminder about: ${reminder.title}`,
                reminderData: {
                  type: reminder.type,
                  priority: reminder.priority,
                  due_date: reminder.due_date
                }
              }
            });
            
            if (emailError) {
              console.error('Email notification failed:', emailError);
            } else {
              console.log('Email notification sent successfully');
            }
          }
          // Note: in_app and whatsapp notifications are handled by status updates
        }
        
        // Mark as sent
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ 
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);
        
        if (updateError) {
          console.error('Error updating reminder status:', updateError);
          failed++;
          continue;
        }
        
        // Handle recurring reminders using the enhanced database function
        if (reminder.recurrence && reminder.recurrence !== 'none') {
          console.log(`Creating next recurring reminder for: ${reminder.id}`);
          
          const { data: nextReminderId, error: recurringError } = await supabase
            .rpc('create_next_recurring_reminder', {
              original_reminder_id: reminder.id
            });
          
          if (recurringError) {
            console.error('Error creating recurring reminder:', recurringError);
          } else if (nextReminderId) {
            console.log(`Created next recurring reminder: ${nextReminderId}`);
          } else {
            console.log('No recurring reminder created (duplicate prevention or logic)');
          }
        }
        
        processed++;
        console.log(`✅ Successfully processed reminder: ${reminder.id}`);
        
      } catch (error) {
        console.error(`❌ Error processing reminder ${reminder.id}:`, error);
        failed++;
        
        // Mark as failed
        await supabase
          .from('reminders')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);
      }
    }
    
    console.log(`Processing completed: ${processed} processed, ${failed} failed`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processed} reminders successfully`,
        processed,
        failed,
        total: dueReminders.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-reminders function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
