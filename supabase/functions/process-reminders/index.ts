
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
    const today = now.toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    
    console.log(`Processing reminders at ${now.toISOString()}`)
    
    // Find reminders that are due based on reminder_time and still pending
    const { data: timeBasedReminders, error: fetchTimeError } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .lte('reminder_time', now.toISOString())
    
    if (fetchTimeError) {
      throw fetchTimeError
    }
    
    // Find todos that are due today based on due_date and still pending
    const { data: dueDateTodos, error: fetchDueDateError } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .eq('type', 'todo')
      .eq('due_date', today)
    
    if (fetchDueDateError) {
      throw fetchDueDateError
    }
    
    // Combine and deduplicate reminders (in case a todo has both reminder_time and due_date on same day)
    const allDueReminders = [...(timeBasedReminders || []), ...(dueDateTodos || [])]
    const uniqueReminders = allDueReminders.filter((reminder, index, self) => 
      index === self.findIndex(r => r.id === reminder.id)
    )
    
    console.log(`Found ${uniqueReminders.length} due reminders to process`)
    console.log(`Time-based reminders: ${timeBasedReminders?.length || 0}`)
    console.log(`Due date todos: ${dueDateTodos?.length || 0}`)
    
    if (uniqueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No due reminders to process' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const processedReminders = []
    const failedReminders = []
    
    // Process each reminder
    for (const reminder of uniqueReminders) {
      try {
        // Determine notification title and body based on reminder type and trigger
        let notificationTitle = reminder.title
        let notificationBody = reminder.description || reminder.title
        
        // Check if this is a due date notification for todos
        if (reminder.type === 'todo' && reminder.due_date === today) {
          notificationTitle = `Due Today: ${reminder.title}`
          notificationBody = `Your todo "${reminder.title}" is due today!`
        }
        
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
                subject: notificationTitle,
                body: notificationBody
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
        
        // Handle recurrence - create next reminder if needed (only for time-based reminders, not due date todos)
        if (reminder.recurrence !== 'none' && reminder.recurrence && reminder.reminder_time) {
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
              // Don't copy due_date for recurring reminders as it's a different concept
              priority: reminder.priority,
              auto_tags: reminder.auto_tags,
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
        failedIds: failedReminders,
        timeBasedCount: timeBasedReminders?.length || 0,
        dueDateCount: dueDateTodos?.length || 0
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
