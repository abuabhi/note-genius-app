
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { DailyDigestEmail } from './_templates/daily-digest.tsx'

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
    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const resend = new Resend(resendApiKey)
    
    console.log('Starting daily digest process...')

    // Get current time and date
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentHour = now.getUTCHours()
    const currentMinute = now.getUTCMinutes()
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`

    console.log(`Processing digests for time: ${currentTime}`)

    // Get users who should receive digest at this time
    const { data: digestUsers, error: fetchError } = await supabase
      .from('email_digest_preferences')
      .select(`
        *,
        profiles!inner(username)
      `)
      .eq('digest_enabled', true)
      .eq('frequency', 'daily')
      .eq('digest_time', currentTime)
      .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${today}`)

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${digestUsers?.length || 0} users to process`)

    if (!digestUsers || digestUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users found for digest at this time' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const processedUsers = []
    const failedUsers = []

    // Process each user
    for (const user of digestUsers) {
      try {
        console.log(`Processing digest for user: ${user.user_id}`)

        // Get user's email from auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.user_id)
        
        if (authError || !authUser.user?.email) {
          console.error(`Failed to get email for user ${user.user_id}:`, authError)
          failedUsers.push({ userId: user.user_id, error: 'No email found' })
          continue
        }

        // Fetch user's goals
        let goals = []
        if (user.include_goals) {
          const goalsQuery = supabase
            .from('study_goals')
            .select('*')
            .eq('user_id', user.user_id)
            .or('status.eq.active,status.is.null')
            .eq('is_completed', false)
            .order('end_date', { ascending: true })

          const { data: goalsData, error: goalsError } = await goalsQuery

          if (goalsError) {
            console.error(`Error fetching goals for user ${user.user_id}:`, goalsError)
          } else {
            goals = goalsData || []
          }
        }

        // Fetch user's todos
        let todos = []
        if (user.include_todos) {
          let todosQuery = supabase
            .from('reminders')
            .select('*')
            .eq('user_id', user.user_id)
            .eq('type', 'todo')
            .eq('status', 'pending')
            .is('auto_archived_at', null)

          if (user.only_urgent) {
            todosQuery = todosQuery.in('escalation_level', ['urgent', 'critical'])
          }

          todosQuery = todosQuery.order('due_date', { ascending: true })

          const { data: todosData, error: todosError } = await todosQuery

          if (todosError) {
            console.error(`Error fetching todos for user ${user.user_id}:`, todosError)
          } else {
            // Calculate days overdue for each todo
            todos = (todosData || []).map(todo => {
              if (todo.due_date) {
                const dueDate = new Date(todo.due_date)
                const today = new Date()
                const diffTime = today.getTime() - dueDate.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return {
                  ...todo,
                  days_overdue: diffDays > 0 ? diffDays : 0
                }
              }
              return todo
            })
          }
        }

        // Count overdue items
        const overdueCount = todos.filter(todo => 
          todo.due_date && new Date(todo.due_date) < new Date()
        ).length

        // Count completed items today (this is a simplified calculation)
        const completedToday = 0 // We would need to track completion dates for this

        // Skip if no content to send and user hasn't opted for empty digests
        if (goals.length === 0 && todos.length === 0 && overdueCount === 0) {
          console.log(`Skipping user ${user.user_id} - no content to digest`)
          continue
        }

        // Generate email HTML
        const appUrl = supabaseUrl.replace('supabase.co', 'supabase.app') // Adjust as needed
        const unsubscribeUrl = `${appUrl}/settings/notifications`

        const emailHtml = await renderAsync(
          React.createElement(DailyDigestEmail, {
            user_name: user.profiles?.username || 'there',
            goals: goals.slice(0, 10), // Limit to prevent email size issues
            todos: todos.slice(0, 15),
            overdue_count: overdueCount,
            completed_today: completedToday,
            app_url: appUrl,
            unsubscribe_url: unsubscribeUrl,
          })
        )

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: 'StudyHub <digest@yourdomain.com>', // Replace with your domain
          to: [authUser.user.email],
          subject: `Your Daily Study Digest - ${goals.length} goals, ${todos.length} tasks`,
          html: emailHtml,
        })

        if (emailError) {
          throw emailError
        }

        // Update last digest sent timestamp
        await supabase
          .from('email_digest_preferences')
          .update({ last_digest_sent_at: now.toISOString() })
          .eq('user_id', user.user_id)

        processedUsers.push(user.user_id)
        console.log(`Successfully sent digest to user: ${user.user_id}`)

      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        failedUsers.push({ 
          userId: user.user_id, 
          error: error.message || 'Unknown error' 
        })
      }
    }

    console.log(`Digest process completed. Processed: ${processedUsers.length}, Failed: ${failedUsers.length}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: processedUsers.length,
        failed: failedUsers.length,
        processedUsers,
        failedUsers,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error in send-daily-digest function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
