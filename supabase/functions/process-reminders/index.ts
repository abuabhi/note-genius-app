
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get current time
    const now = new Date()
    
    // Find reminders that are due and still pending
    const { data: dueReminders, error: fetchError } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .lte('reminder_time', now.toISOString())
    
    if (fetchError) {
      throw fetchError
    }
    
    console.log(`Found ${dueReminders?.length || 0} due reminders to process`)
    
    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No due reminders to process' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const processedReminders = []
    const failedReminders = []
    
    // Process each reminder
    for (const reminder of dueReminders) {
      try {
        // Send notification for each delivery method
        for (const method of reminder.delivery_methods) {
          if (method === 'in_app') {
            // In-app notifications just need status update
            continue
          } else if (method === 'email' || method === 'whatsapp') {
            // Call the send-notification function
            const notificationResponse = await supabase.functions.invoke('send-notification', {
              body: { 
                userId: reminder.user_id,
                type: method,
                subject: `Reminder: ${reminder.title}`,
                body: reminder.description || reminder.title
              }
            })
            
            if (notificationResponse.error) {
              console.error(`Failed to send ${method} notification for reminder ${reminder.id}:`, notificationResponse.error)
            } else {
              console.log(`Successfully sent ${method} notification for reminder ${reminder.id}`)
            }
          }
        }
        
        // Update reminder status to 'sent'
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ status: 'sent' })
          .eq('id', reminder.id)
        
        if (updateError) {
          throw updateError
        }
        
        // Handle recurrence - create next reminder if needed
        if (reminder.recurrence !== 'none') {
          const nextReminderTime = calculateNextReminderTime(reminder.reminder_time, reminder.recurrence)
          
          // Create next recurring reminder
          const { error: recurrenceError } = await supabase
            .from('reminders')
            .insert({
              title: reminder.title,
              description: reminder.description,
              reminder_time: nextReminderTime.toISOString(),
              type: reminder.type,
              delivery_methods: reminder.delivery_methods,
              status: 'pending',
              recurrence: reminder.recurrence,
              event_id: reminder.event_id,
              goal_id: reminder.goal_id,
              user_id: reminder.user_id,
            })
          
          if (recurrenceError) {
            console.error('Error creating recurring reminder:', recurrenceError)
          } else {
            console.log(`Created new recurring reminder for ${reminder.id}`)
          }
        }
        
        processedReminders.push(reminder.id)
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        failedReminders.push({ id: reminder.id, error: error.message })
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedReminders.length,
        failed: failedReminders.length,
        failedIds: failedReminders
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in process-reminders function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to calculate the next reminder time based on recurrence pattern
function calculateNextReminderTime(currentTimeString: string, recurrence: string): Date {
  const currentTime = new Date(currentTimeString)
  const nextTime = new Date(currentTime)
  
  switch (recurrence) {
    case 'daily':
      nextTime.setDate(currentTime.getDate() + 1)
      break
    case 'weekly':
      nextTime.setDate(currentTime.getDate() + 7)
      break
    case 'monthly':
      nextTime.setMonth(currentTime.getMonth() + 1)
      break
    default:
      // No recurrence or unknown type
      break
  }
  
  return nextTime
}
