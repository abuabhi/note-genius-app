import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const {
      userEmail,
      userId,
      reminders = [],
      goals = [],
      sessions = [],
      todos = [],
      flashcards = [],
      quizzes = [],
      timezone = 'UTC'
    } = await req.json();

    // Branding and links (configurable via env)
    const brandName = Deno.env.get('BRAND_NAME') ?? 'PrepGenie';
    const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://www.prepgenie.io').replace(/\/$/, '');
    const logoUrl = Deno.env.get('BRAND_LOGO_URL') ?? 'https://zuhcmwujzfddmafozubd.supabase.co/storage/v1/object/public/assets/prepgenie-logo.png';

    // Supabase client for fetching profile name
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const toTitleCase = (s: string) => s.split(/[\s._-]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    let firstName: string | null = null;
    let username: string | null = null;
    let streakDays = 0;
    let studyStreak: any = null;
    
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, username')
        .eq('id', userId)
        .maybeSingle();
      firstName = (profile as any)?.first_name ?? null;
      username = (profile as any)?.username ?? null;

      // Get study streak data
      const { data: streakData } = await supabase
        .from('study_sessions')
        .select('start_time')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: false });

      if (streakData && streakData.length > 0) {
        const dates = [...new Set(streakData.map(s => new Date(s.start_time).toDateString()))];
        streakDays = dates.length;
        studyStreak = { days: streakDays, isActive: dates.includes(new Date().toDateString()) };
      }
    }
    
    const emailLocal = (userEmail || '').split('@')[0] || 'there';
    const displayName = (firstName && firstName.trim()) || (username && toTitleCase(username.trim())) || toTitleCase(emailLocal);

    // Time-based greeting
    const currentHour = new Date().getHours();
    let greeting = 'Hi';
    if (currentHour < 12) greeting = 'Good morning';
    else if (currentHour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    // Preheader and date formatting
    const currentDate = new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const preheader = `Your personalized study summary for ${currentDate}`;

    // Theme colors (aligned with app tokens: primary ~ hsl(151 68% 50%))
    const mintPrimary = '#059669'; // close to primary
    const mintLight = '#D1FAE5';   // light accent
    const mintDark = '#047857';    // darker primary
    const grayDark = '#111827';    // text strong
    const grayMedium = '#6B7280';  // text muted
    const grayLight = '#F9FAFB';   // section bg

    // Helpers
    const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-US', { timeZone: timezone }) : 'No date';

    // Build HTML
    let content = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Hidden Preheader -->
        <div style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${preheader}</div>
        
        <!-- Header with Logo and Branding -->
        <div style="background: linear-gradient(135deg, ${mintPrimary} 0%, ${mintDark} 100%); padding: 40px 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px; gap: 12px;">
            ${logoUrl ? `<img src="${logoUrl}" alt="${brandName} logo" width="40" height="40" style="display:block;border-radius:8px;">` : `<div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px;">📚</div>`}
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${brandName}</h1>
          </div>
          <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Your Study Digest</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">${currentDate}</p>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <p style="margin:0 0 16px 0;color:${grayDark};font-size:16px;">Hi <strong>${displayName}</strong>,</p>
          <p style="margin:0 0 24px 0;color:${grayMedium};font-size:14px;">Here’s a quick snapshot of what matters most for your learning today.</p>
    `;

    // Todos (priority) - Sort overdue first
    const prioritizedTodos = todos.sort((a: any, b: any) => {
      const aOverdue = a.due_date && new Date(a.due_date) < new Date();
      const bOverdue = b.due_date && new Date(b.due_date) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });

    if (prioritizedTodos && prioritizedTodos.length > 0) {
      const overdueCount = prioritizedTodos.filter((todo: any) => todo.due_date && new Date(todo.due_date) < new Date()).length;
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px;">✅</span> Your Todos
              ${overdueCount > 0 ? `<span style="background: #EF4444; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 12px;">${overdueCount} Overdue</span>` : ''}
            </div>
            ${prioritizedTodos.length > 5 ? `<a href="${siteUrl}/reminders" style="color: ${mintPrimary}; text-decoration: none; font-size: 14px; font-weight: 600;">View All ${prioritizedTodos.length} →</a>` : ''}
          </h2>
          <div style="margin: 16px 0;">
      `;
      prioritizedTodos.slice(0, 5).forEach((todo: any, index: number) => {
        const isOverdue = todo.due_date && new Date(todo.due_date) < new Date();
        const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
        const priorityColor = priorityColors[todo.priority as keyof typeof priorityColors] || priorityColors.medium;
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : mintLight}; border-left: 4px solid ${isOverdue ? '#EF4444' : mintPrimary}; padding: 18px; margin: 16px 0; border-radius: 0 12px 12px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: relative;">
            ${isOverdue ? '<div style="position: absolute; top: 8px; right: 12px; background: #EF4444; color: white; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; text-transform: uppercase;">URGENT</div>' : ''}
            <h4 style="margin: 0; color: ${grayDark}; font-size: 16px; font-weight: 600; ${isOverdue ? 'padding-right: 60px;' : ''}">${todo.title}</h4>
            ${todo.description ? `<p style="margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${todo.description}</p>` : ''}
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 12px; color: ${isOverdue ? '#DC2626' : grayMedium}; background: white; padding: 6px 12px; border-radius: 16px; font-weight: 600; border: 1px solid ${isOverdue ? '#FCA5A5' : '#E5E7EB'};">
                  ${isOverdue ? '⚠️ OVERDUE' : '📅'} ${todo.due_date ? fmtDate(todo.due_date) : 'No due date'}
                </span>
                <span style="font-size: 10px; color: white; background: ${priorityColor}; padding: 4px 8px; border-radius: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${(todo.priority || 'medium')}
                </span>
              </div>
              <a href="${siteUrl}/reminders/${todo.id}" style="color: ${mintPrimary}; text-decoration: none; font-size: 12px; font-weight: 600; padding: 6px 12px; border: 1px solid ${mintPrimary}; border-radius: 8px; background: white;">Complete →</a>
            </div>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Flashcards - Enhanced with smart suggestions
    if (flashcards && flashcards.length > 0) {
      const priorityCards = flashcards.filter((card: any) => card.priority === 'high' || card.overdue);
      const cardsBySubject = flashcards.reduce((acc: any, card: any) => {
        const subject = card.subject || 'General';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(card);
        return acc;
      }, {});

      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px;">🧠</span> Flashcards Ready
              ${priorityCards.length > 0 ? `<span style="background: #F59E0B; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 12px;">${priorityCards.length} Priority</span>` : ''}
            </div>
            <a href="${siteUrl}/flashcards" style="color: ${mintPrimary}; text-decoration: none; font-size: 14px; font-weight: 600;">View All →</a>
          </h2>
          
          <div style="background: linear-gradient(135deg, ${mintLight} 0%, #F0FDF4 100%); border: 1px solid ${mintPrimary}; padding: 24px; border-radius: 16px; margin: 16px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h4 style="margin: 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">📚 ${flashcards.length} cards ready for review</h4>
              <div style="text-align: right;">
                <p style="margin: 0; color: ${mintDark}; font-size: 14px; font-weight: 600;">Optimal Time: ${currentHour < 10 ? '🌅 Morning Focus' : currentHour < 14 ? '☀️ Afternoon Peak' : '🌙 Evening Review'}</p>
              </div>
            </div>
            
            ${Object.keys(cardsBySubject).length > 1 ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">📊 By Subject:</p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  ${Object.entries(cardsBySubject).map(([subject, cards]: [string, any]) => `
                    <span style="background: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; color: ${grayDark}; border: 1px solid #E5E7EB; font-weight: 500;">
                      ${subject}: ${(cards as any[]).length}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <p style="margin: 0 0 16px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">💡 Spaced repetition works best! Review these cards now to boost long-term retention by up to 80%.</p>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="${siteUrl}/flashcards" style="display: inline-block; background: ${mintPrimary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);">🚀 Start Review Session</a>
              ${priorityCards.length > 0 ? `<a href="${siteUrl}/flashcards?filter=priority" style="display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);">⚡ Priority Cards</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Quizzes - Enhanced with difficulty tracking and smart suggestions
    if (quizzes && quizzes.length > 0) {
      const completedQuizzes = quizzes.filter((quiz: any) => quiz.completed);
      const availableQuizzes = quizzes.filter((quiz: any) => !quiz.completed);
      
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 8px;">🎯</span> Knowledge Testing
              <span style="background: ${grayMedium}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 12px;">${availableQuizzes.length} Available</span>
            </div>
            <a href="${siteUrl}/quizzes" style="color: ${mintPrimary}; text-decoration: none; font-size: 14px; font-weight: 600;">View All →</a>
          </h2>
          
          <div style="margin: 16px 0;">
      `;
      
      availableQuizzes.slice(0, 3).forEach((quiz: any, index: number) => {
        const difficultyColors = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };
        const difficultyColor = difficultyColors[quiz.difficulty as keyof typeof difficultyColors] || difficultyColors.medium;
        const estimatedTime = quiz.question_count ? Math.ceil(quiz.question_count * 1.5) : 15;
        
        content += `
          <div style="background: ${grayLight}; border: 1px solid #E5E7EB; padding: 20px; margin: 16px 0; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; right: 0; background: ${difficultyColor}; color: white; padding: 6px 12px; border-radius: 0 16px 0 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${quiz.difficulty || 'Medium'}</div>
            
            <h4 style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 18px; font-weight: 600; padding-right: 80px;">${quiz.title}</h4>
            ${quiz.description ? `<p style="margin: 0 0 16px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${quiz.description}</p>` : ''}
            
            <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0;">
              ${quiz.question_count ? `<span style="font-size: 12px; color: ${grayMedium}; background: white; padding: 4px 10px; border-radius: 12px; border: 1px solid #E5E7EB; font-weight: 500;">📝 ${quiz.question_count} questions</span>` : ''}
              <span style="font-size: 12px; color: ${grayMedium}; background: white; padding: 4px 10px; border-radius: 12px; border: 1px solid #E5E7EB; font-weight: 500;">⏱️ ~${estimatedTime} min</span>
              ${quiz.subject ? `<span style="font-size: 12px; color: ${mintDark}; background: ${mintLight}; padding: 4px 10px; border-radius: 12px; border: 1px solid ${mintPrimary}; font-weight: 500;">📚 ${quiz.subject}</span>` : ''}
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
              <div style="font-size: 12px; color: ${grayMedium};">
                💡 Perfect for ${currentHour < 12 ? 'morning focus' : currentHour < 16 ? 'afternoon learning' : 'evening review'}
              </div>
              <a href="${siteUrl}/quiz/${quiz.id}" style="background: ${mintPrimary}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);">Start Quiz →</a>
            </div>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Goals
    if (goals && goals.length > 0) {
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🎯</span> Your Goals
          </h2>
          <div style="margin: 16px 0;">
      `;
      goals.slice(0, 3).forEach((goal: any) => {
        const progressPercent = goal.progress || 0;
        const isOverdue = goal.end_date && new Date(goal.end_date) < new Date();
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : grayLight}; border: 1px solid ${isOverdue ? '#EF4444' : '#E5E7EB'}; border-left: 4px solid ${isOverdue ? '#EF4444' : mintPrimary}; padding: 20px; margin: 12px 0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 16px; font-weight: 600;">${goal.title}</h4>
            ${goal.description ? `<p style=\"margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;\">${goal.description}</p>` : ''}
            <div style="background: #E5E7EB; height: 12px; border-radius: 6px; margin: 16px 0; overflow: hidden;">
              <div style="background: ${isOverdue ? '#EF4444' : mintPrimary}; height: 12px; border-radius: 6px; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
              <span style="font-size: 14px; color: ${isOverdue ? '#DC2626' : mintDark}; font-weight: 600; background: white; padding: 4px 8px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${progressPercent}% Complete</span>
              <span style="font-size: 12px; color: ${isOverdue ? '#DC2626' : grayMedium}; background: white; padding: 4px 8px; border-radius: 8px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${isOverdue ? '⚠️ OVERDUE' : '📅 Due'}: ${fmtDate(goal.end_date)}
              </span>
            </div>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Study sessions
    if (sessions && sessions.length > 0) {
      const totalMinutes = sessions.reduce((acc: number, session: any) => acc + (session.duration || 0), 0) / 60;
      const activeSessions = sessions.filter((session: any) => session.is_active);
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📊</span> Study Activity
          </h2>
          ${activeSessions.length > 0 ? `
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 16px; margin: 16px 0; border-radius: 12px;">
              <h4 style="margin: 0; color: #92400E; font-size: 16px; font-weight: 600;">⚡ Active Sessions</h4>
              <p style="margin: 8px 0 0 0; color: #B45309; font-size: 14px;">You have ${activeSessions.length} active study session${activeSessions.length > 1 ? 's' : ''}. Don't forget to end them when you're done!</p>
            </div>
          ` : ''}
          <div style="background: ${mintLight}; border: 1px solid ${mintPrimary}; padding: 20px; margin: 16px 0; border-radius: 12px;">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">This Week's Summary</h4>
            <p style="margin: 12px 0 0 0; color: ${mintDark}; font-size: 24px; font-weight: 700;">${Math.round(totalMinutes)} minutes studied</p>
            <p style="margin: 4px 0 0 0; color: ${grayMedium}; font-size: 14px;">across ${sessions.length} session${sessions.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      `;
    }

    // Reminders
    if (reminders && reminders.length > 0) {
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔔</span> Your Reminders
          </h2>
          <div style="margin: 16px 0;">
      `;
      reminders.slice(0, 5).forEach((reminder: any) => {
        const isOverdue = reminder.reminder_time && new Date(reminder.reminder_time) < new Date();
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : grayLight}; border-left: 4px solid ${isOverdue ? '#EF4444' : mintPrimary}; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 16px; font-weight: 600;">${reminder.title}</h4>
            ${reminder.description ? `<p style=\"margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;\">${reminder.description}</p>` : ''}
            <p style="margin: 12px 0 0 0; font-size: 12px; color: ${grayMedium}; background: white; padding: 4px 8px; border-radius: 12px; display: inline-block; font-weight: 500;">${isOverdue ? '⚠️ Overdue' : '📅'} ${fmtDate(reminder.reminder_time)}</p>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Enhanced AI suggestions with achievement celebrations
    const aiSuggestions = [];
    if (studyStreak && studyStreak.days >= 7) {
      aiSuggestions.push({
        icon: '🏆',
        title: 'Achievement Unlocked!',
        message: `Amazing! You've maintained a ${studyStreak.days}-day study streak. You're in the top 10% of consistent learners!`,
        type: 'achievement'
      });
    }
    
    if (goals.length > 0) {
      const overdueGoals = goals.filter((goal: any) => goal.end_date && new Date(goal.end_date) < new Date());
      if (overdueGoals.length > 0) {
        aiSuggestions.push({
          icon: '⚡',
          title: 'Focus Time Needed',
          message: `You have ${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? 's' : ''}. Consider breaking them into smaller, manageable tasks.`,
          type: 'urgent'
        });
      }
    }
    
    // Add time-based recommendations
    if (currentHour >= 9 && currentHour <= 11) {
      aiSuggestions.push({
        icon: '🧠',
        title: 'Peak Learning Time',
        message: 'Your brain is at peak performance right now! This is the perfect time for challenging material or new concepts.',
        type: 'optimal'
      });
    }
    
    // Add default suggestions if none exist
    if (aiSuggestions.length === 0) {
      aiSuggestions.push(
        {
          icon: '📅',
          title: 'Best Study Time',
          message: `Based on your activity, you're most productive during ${currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'} hours.`,
          type: 'insight'
        },
        {
          icon: '🎯',
          title: 'Focus Areas',
          message: 'Review flashcards that haven\'t been studied in the last 3 days for better retention.',
          type: 'recommendation'
        }
      );
    }

    content += `
      <div style="margin-bottom: 32px;">
        <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
          <span style="margin-right: 8px;">🤖</span> AI Study Insights
        </h2>
        <div style="background: linear-gradient(135deg, ${mintLight} 0%, #F0FDF4 100%); border: 1px solid ${mintPrimary}; padding: 24px; border-radius: 16px; margin: 16px 0;">
          <h4 style="margin: 0 0 20px 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">💡 Personalized Recommendations</h4>
          
          ${aiSuggestions.map((suggestion: any, index: number) => `
            <div style="background: ${suggestion.type === 'achievement' ? '#F0FDF4' : suggestion.type === 'urgent' ? '#FEF2F2' : 'white'}; border-left: 4px solid ${suggestion.type === 'achievement' ? '#10B981' : suggestion.type === 'urgent' ? '#EF4444' : mintPrimary}; padding: 16px; margin: 16px 0; border-radius: 0 12px 12px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 24px; margin-top: 2px;">${suggestion.icon}</span>
                <div>
                  <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">${suggestion.title}</p>
                  <p style="margin: 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${suggestion.message}</p>
                </div>
              </div>
            </div>
          `).join('')}
          
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">⚡ Quick Action:</p>
            <p style="margin: 0; color: ${grayMedium}; font-size: 14px;">Start with a 15-minute focused study session to build momentum for the day.</p>
          </div>
        </div>
      </div>
    `;

    content += `
          <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 2px solid ${mintLight};">
            <div style="margin-bottom: 24px;">
              <a href="${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${mintPrimary} 0%, ${mintDark} 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.4); margin: 0 8px 8px 0;">🚀 Open Dashboard</a>
              ${flashcards.length > 0 ? `<a href="${siteUrl}/flashcards" style="display: inline-block; background: #F59E0B; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4); margin: 0 8px 8px 0;">🧠 Review Cards</a>` : ''}
              ${prioritizedTodos.length > 0 ? `<a href="${siteUrl}/reminders" style="display: inline-block; background: #EF4444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4); margin: 0 8px 8px 0;">✅ Complete Tasks</a>` : ''}
            </div>
            <p style="margin: 20px 0 0 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">Ready to boost your learning? Your personalized study experience awaits!</p>
            
            ${studyStreak && studyStreak.days >= 3 ? `
              <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 1px solid #F59E0B; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">🎉 Streak Celebration!</p>
                <p style="margin: 4px 0 0 0; color: #B45309; font-size: 12px;">You're on fire! ${studyStreak.days} days of consistent learning. Keep it up!</p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: ${grayMedium}; font-size: 12px; line-height: 1.5;">
              You're receiving this digest because you have daily notifications enabled.<br>
              <a href="${siteUrl}/settings" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">⚙️ Manage Preferences</a> | 
              <a href="${siteUrl}/help" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">❓ Get Help</a> |
              <a href="${siteUrl}/achievements" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">🏆 View Achievements</a>
            </p>
            <p style="margin: 12px 0 0 0; color: ${grayMedium}; font-size: 11px;">© ${new Date().getFullYear()} ${brandName} - Your AI-Powered Learning Companion</p>
          </div>
        </div>
      </div>
    `;

    // Plain-text alternative (for deliverability and accessibility)
    const textParts: string[] = [];
    textParts.push(`${brandName} — Daily Study Digest (${currentDate})`);
    textParts.push(`Hi ${displayName},`);
    if (todos.length) textParts.push(`• Todos: ${todos.length}`);
    if (flashcards.length) textParts.push(`• Flashcards to review: ${flashcards.length}`);
    if (quizzes.length) textParts.push(`• Quizzes available: ${quizzes.length}`);
    if (goals.length) textParts.push(`• Active goals: ${goals.length}`);
    if (sessions.length) {
      const minutes = Math.round(sessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) / 60);
      textParts.push(`• Study time this week: ${minutes} minutes across ${sessions.length} session(s)`);
    }
    if (reminders.length) textParts.push(`• Reminders: ${reminders.length}`);
    textParts.push(`\nOpen your dashboard: ${siteUrl}/dashboard`);
    textParts.push(`Manage your preferences: ${siteUrl}/settings`);

    const { data, error } = await resend.emails.send({
      from: `${brandName} <noreply@${new URL(siteUrl).hostname.replace(/^www\./, '')}>`,
      to: [userEmail],
      subject: `📚 Your Daily Study Digest - ${currentDate}`,
      html: content,
      text: textParts.join('\n')
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log('✅ Digest email sent successfully:', data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: data?.id,
      sentTo: userEmail
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('❌ Error in send-digest-email:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
