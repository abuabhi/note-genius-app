
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { EnhancedDailyDigestEmail } from './_templates/enhanced-daily-digest.tsx'

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
    
    console.log('Starting enhanced daily digest process...')

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
        console.log(`Processing enhanced digest for user: ${user.user_id}`)

        // Get user's email from auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.user_id)
        
        if (authError || !authUser.user?.email) {
          console.error(`Failed to get email for user ${user.user_id}:`, authError)
          failedUsers.push({ userId: user.user_id, error: 'No email found' })
          continue
        }

        // Initialize content arrays
        let goals = []
        let todos = []
        let notes = []
        let flashcards = []
        let quizzes = []
        let studySessions = []

        // Fetch user's goals
        if (user.include_goals) {
          const goalsQuery = supabase
            .from('study_goals')
            .select('*')
            .eq('user_id', user.user_id)
            .or('status.eq.active,status.is.null')
            .eq('is_completed', false)
            .order('end_date', { ascending: true })
            .limit(10)

          const { data: goalsData, error: goalsError } = await goalsQuery

          if (goalsError) {
            console.error(`Error fetching goals for user ${user.user_id}:`, goalsError)
          } else {
            goals = goalsData || []
          }
        }

        // Fetch user's todos
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

          todosQuery = todosQuery.order('due_date', { ascending: true }).limit(user.todos_limit || 15)

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

        // Fetch user's recent notes
        if (user.include_notes) {
          const { data: notesData, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.user_id)
            .neq('archived', true)
            .order('updated_at', { ascending: false })
            .limit(user.notes_limit || 5)

          if (notesError) {
            console.error(`Error fetching notes for user ${user.user_id}:`, notesError)
          } else {
            notes = notesData || []
          }
        }

        // Fetch user's flashcard sets
        if (user.include_flashcards) {
          const { data: flashcardsData, error: flashcardsError } = await supabase
            .from('flashcard_sets')
            .select(`
              *,
              user_flashcard_progress(last_reviewed_at)
            `)
            .eq('user_id', user.user_id)
            .order('updated_at', { ascending: false })
            .limit(user.flashcards_limit || 5)

          if (flashcardsError) {
            console.error(`Error fetching flashcards for user ${user.user_id}:`, flashcardsError)
          } else {
            flashcards = (flashcardsData || []).map(set => ({
              ...set,
              needs_review: set.user_flashcard_progress?.some(p => 
                !p.last_reviewed_at || 
                new Date(p.last_reviewed_at) < new Date(Date.now() - 24*60*60*1000)
              )
            }))
          }
        }

        // Fetch user's recent quiz results
        if (user.include_quizzes) {
          const { data: quizzesData, error: quizzesError } = await supabase
            .from('quiz_results')
            .select(`
              *,
              quizzes(title)
            `)
            .eq('user_id', user.user_id)
            .order('completed_at', { ascending: false })
            .limit(user.quizzes_limit || 3)

          if (quizzesError) {
            console.error(`Error fetching quizzes for user ${user.user_id}:`, quizzesError)
          } else {
            quizzes = (quizzesData || []).map(result => ({
              ...result,
              title: result.quizzes?.title || 'Untitled Quiz'
            }))
          }
        }

        // Fetch user's recent study sessions
        if (user.include_study_sessions) {
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.user_id)
            .not('end_time', 'is', null)
            .order('start_time', { ascending: false })
            .limit(user.study_sessions_limit || 5)

          if (sessionsError) {
            console.error(`Error fetching study sessions for user ${user.user_id}:`, sessionsError)
          } else {
            studySessions = sessionsData || []
          }
        }

        // Calculate study streak (simplified)
        let studyStreak = 0
        if (user.include_streaks) {
          const { data: streakData } = await supabase
            .from('study_sessions')
            .select('start_time')
            .eq('user_id', user.user_id)
            .not('end_time', 'is', null)
            .gte('start_time', new Date(Date.now() - 7*24*60*60*1000).toISOString())
            .order('start_time', { ascending: false })

          if (streakData) {
            const uniqueDays = new Set(streakData.map(s => 
              new Date(s.start_time).toISOString().split('T')[0]
            ))
            studyStreak = uniqueDays.size
          }
        }

        // Count overdue items
        const overdueCount = todos.filter(todo => 
          todo.due_date && new Date(todo.due_date) < new Date()
        ).length

        // Count completed items today (simplified)
        const completedToday = todos.filter(todo => 
          todo.status === 'completed' && 
          todo.updated_at && 
          new Date(todo.updated_at).toDateString() === new Date().toDateString()
        ).length

        // Skip if no content to send
        const hasContent = goals.length > 0 || todos.length > 0 || notes.length > 0 || 
                          flashcards.length > 0 || quizzes.length > 0 || studySessions.length > 0 ||
                          overdueCount > 0 || studyStreak > 0

        if (!hasContent) {
          console.log(`Skipping user ${user.user_id} - no content to digest`)
          continue
        }

        // Generate email HTML
        const appUrl = supabaseUrl.replace('supabase.co', 'supabase.app')
        const unsubscribeUrl = `${appUrl}/settings/notifications`

        const emailHtml = await renderAsync(
          React.createElement(EnhancedDailyDigestEmail, {
            user_name: user.profiles?.username || 'there',
            goals: goals.slice(0, 10),
            todos: todos.slice(0, 15),
            notes: notes.slice(0, user.notes_limit || 5),
            flashcards: flashcards.slice(0, user.flashcards_limit || 5),
            quizzes: quizzes.slice(0, user.quizzes_limit || 3),
            study_sessions: studySessions.slice(0, user.study_sessions_limit || 5),
            overdue_count: overdueCount,
            completed_today: completedToday,
            study_streak: studyStreak,
            app_url: appUrl,
            unsubscribe_url: unsubscribeUrl,
            preferences: {
              include_goals: user.include_goals,
              include_todos: user.include_todos,
              include_notes: user.include_notes,
              include_flashcards: user.include_flashcards,
              include_quizzes: user.include_quizzes,
              include_study_sessions: user.include_study_sessions,
              include_streaks: user.include_streaks,
              include_recommendations: user.include_recommendations,
            }
          })
        )

        // Generate subject line based on content
        const contentCounts = [
          goals.length > 0 ? `${goals.length} goals` : '',
          todos.length > 0 ? `${todos.length} tasks` : '',
          notes.length > 0 ? `${notes.length} notes` : '',
          flashcards.length > 0 ? `${flashcards.length} flashcard sets` : '',
          quizzes.length > 0 ? `${quizzes.length} quiz results` : '',
          studySessions.length > 0 ? `${studySessions.length} study sessions` : ''
        ].filter(Boolean).join(', ')

        const subject = `Your Daily Study Digest${contentCounts ? ` - ${contentCounts}` : ''}`

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: 'PrepGenie <digest@yourdomain.com>',
          to: [authUser.user.email],
          subject: subject,
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
        console.log(`Successfully sent enhanced digest to user: ${user.user_id}`)

      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        failedUsers.push({ 
          userId: user.user_id, 
          error: error.message || 'Unknown error' 
        })
      }
    }

    console.log(`Enhanced digest process completed. Processed: ${processedUsers.length}, Failed: ${failedUsers.length}`)

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
    console.error('Error in enhanced send-daily-digest function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
