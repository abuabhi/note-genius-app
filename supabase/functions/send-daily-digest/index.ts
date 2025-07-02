
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const resend = new Resend(resendApiKey)

    console.log('🌅 Starting enhanced daily digest processing...')
    
    const now = new Date()
    const currentUtcHour = now.getUTCHours()
    const currentUtcMinute = now.getUTCMinutes()
    const currentUtcTime = `${currentUtcHour.toString().padStart(2, '0')}:${currentUtcMinute.toString().padStart(2, '0')}:00`
    
    console.log(`Current UTC time: ${currentUtcTime}`)

    // Helper function to convert user's local time to UTC
    const convertLocalTimeToUtc = (localTime: string, timezone: string): string => {
      try {
        // Create a date object for today with the user's local time
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const localDateTime = new Date(`${today}T${localTime}`)
        
        // Get timezone offset
        const utcTime = new Date(localDateTime.toLocaleString('en-US', { timeZone: 'UTC' }))
        const localTimeInUserTz = new Date(localDateTime.toLocaleString('en-US', { timeZone: timezone }))
        
        // Calculate offset in milliseconds
        const offsetMs = localTimeInUserTz.getTime() - utcTime.getTime()
        
        // Apply offset to get UTC time
        const utcDateTime = new Date(localDateTime.getTime() - offsetMs)
        
        return utcDateTime.toTimeString().split(' ')[0] // Returns HH:MM:SS
      } catch (error) {
        console.error(`Error converting time for timezone ${timezone}:`, error)
        return localTime // Fallback to original time
      }
    }

    // Get users who should receive digests at this time
    const { data: eligibleUsers, error: usersError } = await supabase
      .from('email_digest_preferences')
      .select(`
        *,
        profiles!inner(id, email, full_name)
      `)
      .eq('digest_enabled', true)
      .not('profiles.email', 'is', null)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    console.log(`Found ${eligibleUsers?.length || 0} users with digest preferences`)

    let processedCount = 0
    let sentCount = 0
    let errorCount = 0

    for (const userPref of eligibleUsers || []) {
      try {
        processedCount++
        console.log(`Processing user ${processedCount}: ${userPref.profiles.email}`)
        
        // Convert user's local digest time to UTC for comparison
        const userUtcTime = convertLocalTimeToUtc(
          userPref.digest_time || '08:00:00',
          userPref.timezone || 'UTC'
        )
        
        console.log(`User ${userPref.profiles.email}: local time ${userPref.digest_time} (${userPref.timezone}) = UTC ${userUtcTime}`)
        
        // Check if current UTC time matches user's converted digest time (within 30-minute window)
        const [userHour, userMinute] = userUtcTime.split(':').map(Number)
        const userTotalMinutes = userHour * 60 + userMinute
        const currentTotalMinutes = currentUtcHour * 60 + currentUtcMinute
        
        // Allow 30-minute window for matching
        const timeDiff = Math.abs(currentTotalMinutes - userTotalMinutes)
        const isTimeMatch = timeDiff <= 30 || timeDiff >= (24 * 60 - 30) // Handle day boundary
        
        if (!isTimeMatch) {
          console.log(`⏰ Skipping user ${userPref.profiles.email} - time mismatch (diff: ${timeDiff} minutes)`)
          continue
        }

        // Check if digest was already sent today
        const today = now.toISOString().split('T')[0]
        if (userPref.last_digest_sent_at) {
          const lastSentDate = new Date(userPref.last_digest_sent_at).toISOString().split('T')[0]
          if (lastSentDate === today) {
            console.log(`📧 Already sent digest today for ${userPref.profiles.email}`)
            continue
          }
        }

        console.log(`✅ Generating digest for ${userPref.profiles.email}`)

        // Fetch user's data for digest
        const userId = userPref.user_id
        
        // Get goals
        const { data: goals } = await supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .limit(userPref.include_goals ? 5 : 0)

        // Get todos (from reminders table)
        const { data: todos } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'todo')
          .eq('status', 'pending')
          .limit(userPref.include_todos ? 10 : 0)

        // Get recent notes
        const { data: notes } = await supabase
          .from('notes')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(userPref.include_notes ? userPref.notes_limit || 5 : 0)

        // Get flashcard sets
        const { data: flashcards } = await supabase
          .from('flashcard_sets')
          .select('id, title, created_at, card_count')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(userPref.include_flashcards ? userPref.flashcards_limit || 5 : 0)

        // Get recent quiz results
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('*, quizzes(title)')
          .eq('user_id', userId)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('completed_at', { ascending: false })
          .limit(userPref.include_quizzes ? userPref.quizzes_limit || 3 : 0)

        // Get recent study sessions
        const { data: studySessions } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('start_time', { ascending: false })
          .limit(userPref.include_study_sessions ? userPref.study_sessions_limit || 5 : 0)

        // Calculate study streak
        let studyStreak = 0
        if (userPref.include_streaks) {
          const { data: recentSessions } = await supabase
            .from('study_sessions')
            .select('start_time')
            .eq('user_id', userId)
            .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('start_time', { ascending: false })

          if (recentSessions && recentSessions.length > 0) {
            const sessionDates = [...new Set(recentSessions.map(s => 
              new Date(s.start_time).toISOString().split('T')[0]
            ))].sort().reverse()
            
            let currentDate = new Date().toISOString().split('T')[0]
            studyStreak = 0
            
            for (const sessionDate of sessionDates) {
              if (sessionDate === currentDate) {
                studyStreak++
                const date = new Date(currentDate)
                date.setDate(date.getDate() - 1)
                currentDate = date.toISOString().split('T')[0]
              } else {
                break
              }
            }
          }
        }

        // Generate email content
        const userName = userPref.profiles.full_name || userPref.profiles.email.split('@')[0]
        
        let emailContent = `
          <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">📚 Your Daily Study Digest</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Hello ${userName}! Here's your personalized study summary</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        `

        // Add study streak
        if (userPref.include_streaks && studyStreak > 0) {
          emailContent += `
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
              <h3 style="margin: 0 0 5px 0; color: #0ea5e9; font-size: 16px;">🔥 Study Streak</h3>
              <p style="margin: 0; color: #1e293b; font-size: 14px;">You're on a ${studyStreak}-day study streak! Keep it up!</p>
            </div>
          `
        }

        // Add active goals
        if (userPref.include_goals && goals && goals.length > 0) {
          emailContent += `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">🎯 Active Goals</h3>
          `
          
          goals.forEach(goal => {
            const daysLeft = Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            emailContent += `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #92400e; font-size: 14px; font-weight: 600;">${goal.title}</h4>
                <p style="margin: 0; color: #78350f; font-size: 12px;">${daysLeft} days remaining • ${goal.progress || 0}% complete</p>
              </div>
            `
          })
          
          emailContent += `</div>`
        }

        // Add pending todos
        if (userPref.include_todos && todos && todos.length > 0) {
          emailContent += `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">✅ Pending Tasks</h3>
          `
          
          todos.slice(0, 5).forEach(todo => {
            const isOverdue = todo.due_date && new Date(todo.due_date) < new Date()
            const priority = todo.priority || 'medium'
            const priorityColor = priority === 'high' ? '#ef4444' : priority === 'low' ? '#6b7280' : '#f59e0b'
            
            emailContent += `
              <div style="background: ${isOverdue ? '#fef2f2' : '#f8fafc'}; border-left: 4px solid ${isOverdue ? '#ef4444' : priorityColor}; padding: 12px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0; color: ${isOverdue ? '#dc2626' : '#1e293b'}; font-size: 14px; font-weight: 600;">${todo.title}</h4>
                ${todo.due_date ? `<p style="margin: 0; color: ${isOverdue ? '#dc2626' : '#6b7280'}; font-size: 12px;">Due: ${new Date(todo.due_date).toLocaleDateString()}${isOverdue ? ' (Overdue)' : ''}</p>` : ''}
              </div>
            `
          })
          
          emailContent += `</div>`
        }

        // Add recent notes
        if (userPref.include_notes && notes && notes.length > 0) {
          emailContent += `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">📝 Recent Notes</h3>
          `
          
          notes.forEach(note => {
            emailContent += `
              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #1d4ed8; font-size: 14px; font-weight: 600;">${note.title}</h4>
                <p style="margin: 0; color: #1e40af; font-size: 12px;">Created ${new Date(note.created_at).toLocaleDateString()}</p>
              </div>
            `
          })
          
          emailContent += `</div>`
        }

        // Add flashcard sets
        if (userPref.include_flashcards && flashcards && flashcards.length > 0) {
          emailContent += `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">🃏 Flashcard Sets</h3>
          `
          
          flashcards.forEach(set => {
            emailContent += `
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #15803d; font-size: 14px; font-weight: 600;">${set.title}</h4>
                <p style="margin: 0; color: #166534; font-size: 12px;">${set.card_count || 0} cards</p>
              </div>
            `
          })
          
          emailContent += `</div>`
        }

        // Add recent quiz results
        if (userPref.include_quizzes && quizResults && quizResults.length > 0) {
          emailContent += `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">🧠 Recent Quiz Results</h3>
          `
          
          quizResults.forEach(result => {
            const percentage = Math.round((result.score / result.total_questions) * 100)
            const scoreColor = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444'
            
            emailContent += `
              <div style="background: #fefce8; border-left: 4px solid ${scoreColor}; padding: 12px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #713f12; font-size: 14px; font-weight: 600;">${result.quizzes?.title || 'Quiz'}</h4>
                <p style="margin: 0; color: #a16207; font-size: 12px;">Score: ${result.score}/${result.total_questions} (${percentage}%)</p>
              </div>
            `
          })
          
          emailContent += `</div>`
        }

        // Add recent study sessions with quality metrics
        if (userPref.include_study_sessions && studySessions && studySessions.length > 0) {
          emailContent += `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">⏱️ Recent Study Sessions</h3>
          `
          
          studySessions.forEach(session => {
            const duration = session.duration ? Math.round(session.duration / 60) : 0
            const qualityColor = session.session_quality === 'excellent' ? '#22c55e' : 
                               session.session_quality === 'good' ? '#3b82f6' : 
                               session.session_quality === 'needs_improvement' ? '#f59e0b' : '#ef4444'
            
            emailContent += `
              <div style="background: #fafafa; border-left: 4px solid ${qualityColor}; padding: 12px; margin-bottom: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${session.title}</h4>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  ${duration} minutes • Quality: ${session.session_quality || 'good'}
                  ${session.subject ? ` • ${session.subject}` : ''}
                </p>
              </div>
            `
          })
          
          emailContent += `</div>`
        }

        // Add AI recommendations if enabled
        if (userPref.include_recommendations) {
          const recommendations = []
          
          if (goals && goals.length > 0) {
            const overdueGoals = goals.filter(g => new Date(g.end_date) < new Date())
            if (overdueGoals.length > 0) {
              recommendations.push("📅 You have overdue goals. Consider extending deadlines or breaking them into smaller tasks.")
            }
          }
          
          if (todos && todos.length > 5) {
            recommendations.push("📋 You have many pending tasks. Try prioritizing the most important ones first.")
          }
          
          if (studyStreak === 0) {
            recommendations.push("🚀 Start a new study streak today! Even 15 minutes of focused study can make a difference.")
          }
          
          if (studySessions && studySessions.length === 0) {
            recommendations.push("📚 No recent study sessions detected. Schedule some focused study time today.")
          }
          
          if (recommendations.length > 0) {
            emailContent += `
              <div style="background: #f8fafc; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px;">🤖 AI Recommendations</h3>
            `
            
            recommendations.forEach(rec => {
              emailContent += `<p style="margin: 8px 0; color: #475569; font-size: 14px; line-height: 1.5;">${rec}</p>`
            })
            
            emailContent += `</div>`
          }
        }

        // Close email content
        emailContent += `
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Keep up the great work! 🌟<br>
                  <a href="https://zuhcmwujzfddmafozubd.supabase.co" style="color: #3b82f6; text-decoration: none;">Visit your dashboard</a>
                </p>
                <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                  You can update your digest preferences in your account settings.
                </p>
              </div>
            </div>
          </div>
        `

        // Send email
        const emailResult = await resend.emails.send({
          from: 'StudyBuddy <onboarding@resend.dev>',
          to: [userPref.profiles.email],
          subject: `📚 Your Study Digest - ${new Date().toLocaleDateString()}`,
          html: emailContent,
        })

        if (emailResult.error) {
          console.error(`Failed to send digest to ${userPref.profiles.email}:`, emailResult.error)
          errorCount++
        } else {
          console.log(`✅ Digest sent successfully to ${userPref.profiles.email}`)
          sentCount++

          // Update last_digest_sent_at
          await supabase
            .from('email_digest_preferences')
            .update({ last_digest_sent_at: new Date().toISOString() })
            .eq('user_id', userId)
        }

      } catch (error) {
        console.error(`Error processing digest for user:`, error)
        errorCount++
      }
    }

    console.log(`📊 Digest processing complete: ${sentCount} sent, ${errorCount} errors out of ${processedCount} processed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enhanced daily digest processing complete`,
        stats: {
          processed: processedCount,
          sent: sentCount,
          errors: errorCount,
          timestamp: new Date().toISOString()
        }
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
