
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
    
    console.log('📧 Starting daily digest processing at:', new Date().toISOString());
    
    // Get users ready for digest
    const { data: users, error: usersError } = await supabase
      .rpc('get_digest_users');
    
    if (usersError) {
      console.error('❌ Error fetching digest users:', usersError);
      throw usersError;
    }
    
    if (!users || users.length === 0) {
      console.log('✅ No users need digest today');
      return new Response(JSON.stringify({ 
        success: true, 
        sent: 0,
        message: 'No users need digest'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📬 Processing digest for ${users.length} users`);
    
    let sentCount = 0;
    let failedCount = 0;
    
    for (const user of users) {
      try {
        // Enhanced time check with detailed logging
        const now = new Date();
        // Properly convert UTC time to user's timezone
        const userTime = new Date(now.toLocaleString("en-US", {timeZone: user.timezone || 'UTC'}));
        const currentHour = userTime.getHours();
        const currentMinute = userTime.getMinutes();
        const digestHour = parseInt(user.digest_time.split(':')[0]);
        const digestMinute = parseInt(user.digest_time.split(':')[1] || '0');
        
        // Create exact digest time for today in user's timezone
        const todayDigestTime = new Date(userTime);
        todayDigestTime.setHours(digestHour, digestMinute, 0, 0);
        
        // Check if we're within 30 minutes of digest time (before or after)
        const timeDiff = Math.abs(userTime.getTime() - todayDigestTime.getTime());
        const withinWindow = timeDiff <= 30 * 60 * 1000; // 30 minutes in milliseconds
        
        console.log(`🕐 User ${user.email} time check: current=${currentHour}:${currentMinute.toString().padStart(2, '0')}, target=${digestHour}:${digestMinute.toString().padStart(2, '0')}, diff=${Math.round(timeDiff/60000)}min, inWindow=${withinWindow}, timezone=${user.timezone}`);
        
        if (!withinWindow) {
          console.log(`⏰ Skipping user ${user.email}: not in time window`);
          continue;
        }
        
        // Fetch user preferences and enforce frequency/content toggles
        const { data: prefs } = await supabase
          .from('email_digest_preferences')
          .select('*')
          .eq('user_id', user.user_id)
          .maybeSingle();

        const digestEnabled = prefs?.digest_enabled ?? true;
        const frequency: 'daily' | 'weekly' | 'never' = (prefs?.frequency as any) || 'daily';

        if (!digestEnabled || frequency === 'never') {
          console.log(`⛔ Skipping ${user.email}: digest disabled or frequency=never`);
          continue;
        }

        // Weekly gating: only send if 7+ days since last sent
        if (frequency === 'weekly') {
          const lastSent = user.last_digest_sent_at || prefs?.last_digest_sent_at;
          if (lastSent) {
            const last = new Date(lastSent);
            const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays < 6.5) {
              console.log(`📆 Skipping ${user.email}: weekly frequency window not reached (${diffDays.toFixed(1)}d)`);
              continue;
            }
          }
        }

        // Conditionally load content based on prefs
        let reminders: any[] = [];
        let goals: any[] = [];
        let sessions: any[] = [];
        let todos: any[] = [];
        let flashcardProgress: any[] = [];
        let quizzes: any[] = [];
        let notes: any[] = [];

        // General reminders (independent toggle)
        {
          const { data } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', user.user_id)
            .in('status', ['pending', 'sent'])
            .order('reminder_time', { ascending: true })
            .limit(10);
          reminders = data || [];
        }
        
        if (prefs?.include_goals) {
          const { data } = await supabase
            .from('study_goals')
            .select('*')
            .eq('user_id', user.user_id)
            .eq('status', 'active')
            .order('end_date', { ascending: true })
            .limit(5);
          goals = data || [];
        }
        
        if (prefs?.include_study_sessions) {
          const { data } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.user_id)
            .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('start_time', { ascending: false })
            .limit(prefs?.study_sessions_limit ?? 5);
          sessions = data || [];
        }

        if (prefs?.include_todos) {
          // Base pending todos
          let base = supabase
            .from('reminders')
            .select('*')
            .eq('user_id', user.user_id)
            .eq('type', 'todo')
            .order('due_date', { ascending: true })
            .limit(10);

          if (prefs?.only_urgent) {
            // Filter urgent/critical after fetch due to limited query operators
            const { data } = await base;
            todos = (data || []).filter((t: any) => ['urgent', 'critical'].includes(t.escalation_level));
          } else {
            // Include completed if requested; otherwise pending only
            if (prefs?.include_completed) {
              const { data } = await supabase
                .from('reminders')
                .select('*')
                .eq('user_id', user.user_id)
                .eq('type', 'todo')
                .in('status', ['pending', 'completed'])
                .order('due_date', { ascending: true })
                .limit(10);
              todos = data || [];
            } else {
              const { data } = await base.eq('status', 'pending');
              todos = data || [];
            }
          }
        }

        if (prefs?.include_flashcards) {
          const { data } = await supabase
            .from('user_flashcard_progress')
            .select(`
              *,
              flashcards!inner(
                front,
                flashcard_sets!inner(title)
              )
            `)
            .eq('user_id', user.user_id)
            .lte('next_review_at', new Date().toISOString())
            .order('next_review_at', { ascending: true })
            .limit(prefs?.flashcards_limit ?? 10);
          flashcardProgress = data || [];
        }

        if (prefs?.include_quizzes) {
          const { data } = await supabase
            .from('quizzes')
            .select(`
              id,
              title,
              description,
              created_at
            `)
            .eq('user_id', user.user_id)
            .order('created_at', { ascending: false })
            .limit(prefs?.quizzes_limit ?? 3);
          quizzes = data || [];
        }

        if (prefs?.include_notes) {
          const { data } = await supabase
            .from('notes')
            .select('id, title, description, updated_at')
            .eq('user_id', user.user_id)
            .order('updated_at', { ascending: false })
            .limit(prefs?.notes_limit ?? 5);
          notes = data || [];
        }
        
        // Enhanced content logging
        const reminderCount = reminders?.length || 0;
        const goalCount = goals?.length || 0;
        const sessionCount = sessions?.length || 0;
        const todoCount = todos?.length || 0;
        const flashcardCount = flashcardProgress?.length || 0;
        const quizCount = quizzes?.length || 0;
        
        console.log(`📊 User ${user.email} content: ${reminderCount} reminders, ${goalCount} goals, ${sessionCount} sessions, ${todoCount} todos, ${flashcardCount} flashcards, ${quizCount} quizzes`);
        
        // Skip if no content (keep any content as we have more sections now)
        if (reminderCount === 0 && goalCount === 0 && sessionCount === 0 && todoCount === 0 && flashcardCount === 0 && quizCount === 0) {
          console.log(`📭 Skipping user ${user.email}: no content for digest`);
          continue;
        }
        
        // Send digest email
        const { error: emailError } = await supabase.functions.invoke('send-digest-email', {
          body: {
            userEmail: user.email,
            userId: user.user_id,
            reminders: reminders || [],
            goals: goals || [],
            sessions: sessions || [],
            todos: todos || [],
            flashcards: flashcardProgress || [],
            quizzes: quizzes || [],
            timezone: user.timezone || 'UTC'
          }
        });
        
        if (emailError) {
          console.error(`❌ Failed to send digest to ${user.email}:`, emailError);
          failedCount++;
          continue;
        }
        
        // Update last sent timestamp
        await supabase
          .from('email_digest_preferences')
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq('user_id', user.user_id);
        
        console.log(`✅ Digest sent to ${user.email}`);
        sentCount++;
        
      } catch (error) {
        console.error(`❌ Error processing digest for user ${user.user_id}:`, error);
        failedCount++;
      }
    }
    
    const result = {
      success: true,
      total: users.length,
      sent: sentCount,
      failed: failedCount,
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 Digest processing complete:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Critical error in digest processing:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
