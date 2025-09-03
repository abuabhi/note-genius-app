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

    // Supabase client for fetching profile name and streak data
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const toTitleCase = (s: string) => s.split(/[\s._-]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    let firstName: string | null = null;
    let username: string | null = null;
    let streakDays = 0;
    let studyStreak: any = null;
    let achievements: any[] = [];
    
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

      // Get recent achievements
      const { data: recentAchievements } = await supabase
        .from('study_achievements')
        .select('title, description, achieved_at, badge_image')
        .eq('user_id', userId)
        .gte('achieved_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('achieved_at', { ascending: false })
        .limit(3);
      
      achievements = recentAchievements || [];
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
    const preheader = `${greeting} ${displayName}! Your personalized study digest for ${currentDate}`;

    // Theme colors (aligned with app tokens: primary ~ hsl(151 68% 50%))
    const mintPrimary = '#059669'; // close to primary
    const mintLight = '#D1FAE5';   // light accent
    const mintDark = '#047857';    // darker primary
    const grayDark = '#111827';    // text strong
    const grayMedium = '#6B7280';  // text muted
    const grayLight = '#F9FAFB';   // section bg

    // Helpers
    const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-US', { timeZone: timezone }) : 'No date';

    // Build HTML with enhanced template
    let content = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Hidden Preheader -->
        <div style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${preheader}</div>
        
        <!-- Header with Logo and Branding -->
        <div style="background: linear-gradient(135deg, ${mintPrimary} 0%, ${mintDark} 100%); padding: 40px 32px; text-align: center; border-radius: 12px 12px 0 0; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30px, -30px);"></div>
          <div style="position: absolute; bottom: 0; left: 0; width: 80px; height: 80px; background: rgba(255,255,255,0.08); border-radius: 50%; transform: translate(-20px, 20px);"></div>
          
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px; gap: 12px; position: relative; z-index: 1;">
            <img src="${logoUrl}" alt="${brandName} logo" width="48" height="48" style="display:block;border-radius:12px;box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">${brandName}</h1>
          </div>
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Your Daily Study Digest</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">${currentDate}</p>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 24px;">
            <p style="margin:0 0 8px 0;color:${grayDark};font-size:20px;font-weight:700;">${greeting} <strong>${displayName}!</strong></p>
            ${studyStreak && studyStreak.days > 0 ? `
              <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 1px solid #F59E0B; padding: 16px 20px; border-radius: 16px; margin: 20px 0; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);">
                <span style="font-size: 32px;">🔥</span>
                <div>
                  <p style="margin: 0; color: #92400E; font-size: 16px; font-weight: 800;">${studyStreak.days} Day Study Streak${studyStreak.isActive ? ' (Active!)' : ''}</p>
                  <p style="margin: 4px 0 0 0; color: #B45309; font-size: 14px; font-weight: 500;">You're crushing it! Keep the momentum going! 🚀</p>
                </div>
              </div>
            ` : ''}
            
            ${achievements.length > 0 ? `
              <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 1px solid ${mintPrimary}; padding: 16px 20px; border-radius: 16px; margin: 20px 0;">
                <h4 style="margin: 0 0 12px 0; color: ${mintDark}; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                  🏆 Recent Achievements
                </h4>
                ${achievements.map(achievement => `
                  <div style="display: flex; align-items: center; gap: 12px; margin: 8px 0;">
                    <span style="font-size: 20px;">🎉</span>
                    <div>
                      <p style="margin: 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">${achievement.title}</p>
                      <p style="margin: 2px 0 0 0; color: ${grayMedium}; font-size: 12px;">${achievement.description}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <p style="margin:0 0 16px 0;color:${grayMedium};font-size:16px;">Here's your personalized study summary for today:</p>
          </div>

          <!-- Priority Content Section -->
    `;

    // Sort and prioritize content - overdue items first
    const prioritizedTodos = todos.sort((a: any, b: any) => {
      const aOverdue = a.due_date && new Date(a.due_date) < new Date();
      const bOverdue = b.due_date && new Date(b.due_date) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });

    const prioritizedGoals = goals.sort((a: any, b: any) => {
      const aOverdue = a.end_date && new Date(a.end_date) < new Date();
      const bOverdue = b.end_date && new Date(b.end_date) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });

    // Todos - Enhanced with priority system
    if (prioritizedTodos && prioritizedTodos.length > 0) {
      const overdueCount = prioritizedTodos.filter((todo: any) => todo.due_date && new Date(todo.due_date) < new Date()).length;
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 24px;">✅</span> Your Todos
              ${overdueCount > 0 ? `<span style="background: #EF4444; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-left: 16px; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);">${overdueCount} Overdue</span>` : ''}
            </div>
            ${prioritizedTodos.length > 5 ? `<a href="${siteUrl}/reminders" style="color: ${mintPrimary}; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; border: 2px solid ${mintPrimary}; border-radius: 8px; background: white;">View All ${prioritizedTodos.length} →</a>` : ''}
          </h2>
          <div style="margin: 16px 0;">
      `;
      
      prioritizedTodos.slice(0, 5).forEach((todo: any, index: number) => {
        const isOverdue = todo.due_date && new Date(todo.due_date) < new Date();
        const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
        const priorityColor = priorityColors[todo.priority as keyof typeof priorityColors] || priorityColors.medium;
        
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : mintLight}; border: 1px solid ${isOverdue ? '#EF4444' : '#E5E7EB'}; border-left: 6px solid ${isOverdue ? '#EF4444' : mintPrimary}; padding: 20px; margin: 16px 0; border-radius: 0 16px 16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative;">
            ${isOverdue ? '<div style="position: absolute; top: 12px; right: 16px; background: #EF4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">URGENT</div>' : ''}
            
            <h4 style="margin: 0; color: ${grayDark}; font-size: 18px; font-weight: 700; ${isOverdue ? 'padding-right: 80px;' : ''}">${todo.title}</h4>
            ${todo.description ? `<p style="margin: 12px 0; color: ${grayMedium}; font-size: 15px; line-height: 1.6;">${todo.description}</p>` : ''}
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 20px; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <span style="font-size: 13px; color: ${isOverdue ? '#DC2626' : grayMedium}; background: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; border: 2px solid ${isOverdue ? '#FCA5A5' : '#E5E7EB'}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  ${isOverdue ? '⚠️ OVERDUE' : '📅'} ${todo.due_date ? fmtDate(todo.due_date) : 'No due date'}
                </span>
                <span style="font-size: 11px; color: white; background: ${priorityColor}; padding: 6px 12px; border-radius: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                  ${(todo.priority || 'medium')}
                </span>
              </div>
              <a href="${siteUrl}/reminders/${todo.id}" style="color: white; background: ${mintPrimary}; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); transition: all 0.2s;">✓ Mark Complete</a>
            </div>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Flashcards - Enhanced with smart recommendations
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
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 24px;">🧠</span> Smart Flashcard Review
              ${priorityCards.length > 0 ? `<span style="background: #F59E0B; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-left: 16px; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);">${priorityCards.length} Priority</span>` : ''}
            </div>
            <a href="${siteUrl}/flashcards" style="color: ${mintPrimary}; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; border: 2px solid ${mintPrimary}; border-radius: 8px; background: white;">View All →</a>
          </h2>
          
          <div style="background: linear-gradient(135deg, ${mintLight} 0%, #F0FDF4 100%); border: 2px solid ${mintPrimary}; padding: 28px; border-radius: 20px; margin: 16px 0; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.15);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
              <h4 style="margin: 0; color: ${grayDark}; font-size: 20px; font-weight: 700;">📚 ${flashcards.length} cards ready for optimal learning</h4>
              <div style="text-align: right;">
                <p style="margin: 0; color: ${mintDark}; font-size: 14px; font-weight: 600;">⚡ Peak Time: ${currentHour < 10 ? '🌅 Morning Focus' : currentHour < 14 ? '☀️ Afternoon Peak' : '🌙 Evening Review'}</p>
              </div>
            </div>
            
            ${Object.keys(cardsBySubject).length > 1 ? `
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 12px 0; color: ${grayDark}; font-size: 15px; font-weight: 600;">📊 Subject Breakdown:</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  ${Object.entries(cardsBySubject).map(([subject, cards]: [string, any]) => `
                    <span style="background: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; color: ${grayDark}; border: 2px solid #E5E7EB; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                      ${subject}: ${(cards as any[]).length}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div style="background: rgba(255,255,255,0.8); padding: 16px; border-radius: 12px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">🧠 Science-Based Learning Tip:</p>
              <p style="margin: 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">Spaced repetition increases retention by up to 80%! Review these cards now while your memory is fresh.</p>
            </div>
            
            <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px;">
              <a href="${siteUrl}/flashcards" style="display: inline-block; background: linear-gradient(135deg, ${mintPrimary} 0%, ${mintDark} 100%); color: white; padding: 16px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.4); transition: all 0.3s;">🚀 Start Review Session</a>
              ${priorityCards.length > 0 ? `<a href="${siteUrl}/flashcards?filter=priority" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 16px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);">⚡ Priority Cards</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Enhanced Goals with smart progress tracking
    if (prioritizedGoals && prioritizedGoals.length > 0) {
      const overdueGoals = prioritizedGoals.filter((goal: any) => goal.end_date && new Date(goal.end_date) < new Date());
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 24px;">🎯</span> Your Learning Goals
              ${overdueGoals.length > 0 ? `<span style="background: #EF4444; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-left: 16px;">${overdueGoals.length} Need Attention</span>` : ''}
            </div>
            <a href="${siteUrl}/goals" style="color: ${mintPrimary}; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; border: 2px solid ${mintPrimary}; border-radius: 8px; background: white;">View All →</a>
          </h2>
          <div style="margin: 16px 0;">
      `;
      
      prioritizedGoals.slice(0, 3).forEach((goal: any) => {
        const progressPercent = goal.progress || 0;
        const isOverdue = goal.end_date && new Date(goal.end_date) < new Date();
        const timeRemaining = goal.end_date ? Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
        
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : grayLight}; border: 2px solid ${isOverdue ? '#EF4444' : '#E5E7EB'}; border-left: 6px solid ${isOverdue ? '#EF4444' : mintPrimary}; padding: 24px; margin: 20px 0; border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); position: relative;">
            ${isOverdue ? '<div style="position: absolute; top: 16px; right: 20px; background: #EF4444; color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);">NEEDS ATTENTION</div>' : ''}
            
            <h4 style="margin: 0; color: ${grayDark}; font-size: 20px; font-weight: 700; ${isOverdue ? 'padding-right: 140px;' : ''}">${goal.title}</h4>
            ${goal.description ? `<p style="margin: 12px 0; color: ${grayMedium}; font-size: 15px; line-height: 1.6;">${goal.description}</p>` : ''}
            
            <!-- Enhanced Progress Bar -->
            <div style="background: #E5E7EB; height: 16px; border-radius: 10px; margin: 20px 0; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: ${isOverdue ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)' : `linear-gradient(90deg, ${mintPrimary} 0%, ${mintDark} 100%)`}; height: 16px; border-radius: 10px; width: ${progressPercent}%; transition: width 0.8s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.2); position: relative;">
                ${progressPercent > 15 ? `<div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: white; font-size: 10px; font-weight: 700;">${progressPercent}%</div>` : ''}
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 20px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 16px; color: ${isOverdue ? '#DC2626' : mintDark}; font-weight: 700; background: white; padding: 8px 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid ${isOverdue ? '#FCA5A5' : mintLight};">${progressPercent}% Complete</span>
                ${timeRemaining !== null ? `
                  <span style="font-size: 13px; color: ${isOverdue ? '#DC2626' : grayMedium}; background: white; padding: 8px 12px; border-radius: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    ${isOverdue ? '⚠️ OVERDUE' : timeRemaining > 0 ? `📅 ${timeRemaining} days left` : '🏁 Due today'}
                  </span>
                ` : ''}
              </div>
              <a href="${siteUrl}/goals/${goal.id}" style="color: white; background: ${isOverdue ? '#EF4444' : mintPrimary}; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">📈 View Progress</a>
            </div>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Enhanced Study Sessions with insights
    if (sessions && sessions.length > 0) {
      const totalMinutes = sessions.reduce((acc: number, session: any) => acc + (session.duration || 0), 0) / 60;
      const activeSessions = sessions.filter((session: any) => session.is_active);
      const avgSessionLength = sessions.length > 0 ? totalMinutes / sessions.length : 0;
      
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 22px; font-weight: 800; display: flex; align-items: center;">
            <span style="margin-right: 12px; font-size: 24px;">📊</span> Study Analytics & Insights
          </h2>
          
          ${activeSessions.length > 0 ? `
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; padding: 20px; margin: 16px 0; border-radius: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);">
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 32px;">⚡</span>
                <div>
                  <h4 style="margin: 0; color: #92400E; font-size: 18px; font-weight: 700;">Active Study Sessions</h4>
                  <p style="margin: 4px 0 0 0; color: #B45309; font-size: 14px;">You have ${activeSessions.length} active session${activeSessions.length > 1 ? 's' : ''} running. Don't forget to end them when you're done!</p>
                </div>
              </div>
            </div>
          ` : ''}
          
          <div style="background: linear-gradient(135deg, ${mintLight} 0%, #F0FDF4 100%); border: 2px solid ${mintPrimary}; padding: 28px; border-radius: 20px; margin: 16px 0; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.15);">
            <h4 style="margin: 0 0 20px 0; color: ${grayDark}; font-size: 20px; font-weight: 700;">📈 This Week's Performance</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: ${mintDark}; font-size: 32px; font-weight: 900;">${Math.round(totalMinutes)}</p>
                <p style="margin: 4px 0 0 0; color: ${grayMedium}; font-size: 14px; font-weight: 600;">minutes studied</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: ${mintDark}; font-size: 32px; font-weight: 900;">${sessions.length}</p>
                <p style="margin: 4px 0 0 0; color: ${grayMedium}; font-size: 14px; font-weight: 600;">study session${sessions.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            ${avgSessionLength > 0 ? `
              <div style="background: rgba(255,255,255,0.8); padding: 16px; border-radius: 12px;">
                <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">💡 Productivity Insight:</p>
                <p style="margin: 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">Your average session length is ${Math.round(avgSessionLength)} minutes. ${avgSessionLength > 45 ? 'Great focus! Consider short breaks every 45-50 minutes.' : avgSessionLength > 25 ? 'Good rhythm! Try extending to 45 minutes for deeper focus.' : 'Consider longer sessions (25-45 minutes) for better learning retention.'}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Enhanced AI Insights with Achievement Recognition
    const aiSuggestions = [];
    
    // Achievement-based suggestions
    if (studyStreak && studyStreak.days >= 7) {
      aiSuggestions.push({
        icon: '🏆',
        title: 'Streak Superstar!',
        message: `Incredible! Your ${studyStreak.days}-day streak puts you in the top 10% of consistent learners. You're building a powerful learning habit!`,
        type: 'achievement'
      });
    }
    
    // Goal-based insights
    if (goals.length > 0) {
      const overdueGoals = goals.filter((goal: any) => goal.end_date && new Date(goal.end_date) < new Date());
      const nearDeadlineGoals = goals.filter((goal: any) => {
        if (!goal.end_date) return false;
        const daysUntilDeadline = Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline > 0 && daysUntilDeadline <= 3;
      });
      
      if (overdueGoals.length > 0) {
        aiSuggestions.push({
          icon: '⚡',
          title: 'Focus Time Needed',
          message: `${overdueGoals.length} goal${overdueGoals.length > 1 ? 's need' : ' needs'} attention. Try breaking them into 15-minute micro-tasks for quick wins!`,
          type: 'urgent'
        });
      } else if (nearDeadlineGoals.length > 0) {
        aiSuggestions.push({
          icon: '🎯',
          title: 'Deadline Alert',
          message: `${nearDeadlineGoals.length} goal${nearDeadlineGoals.length > 1 ? 's are' : ' is'} due soon. Perfect time for a focused study sprint!`,
          type: 'important'
        });
      }
    }
    
    // Time-based recommendations
    if (currentHour >= 9 && currentHour <= 11) {
      aiSuggestions.push({
        icon: '🧠',
        title: 'Peak Brain Power Hour',
        message: 'Your cognitive performance is at its peak right now! Perfect for tackling challenging material or learning new concepts.',
        type: 'optimal'
      });
    } else if (currentHour >= 14 && currentHour <= 16) {
      aiSuggestions.push({
        icon: '🔄',
        title: 'Afternoon Review Time',
        message: 'Great time for reviewing and reinforcing what you learned this morning. Your brain loves this consolidation period!',
        type: 'optimal'
      });
    }
    
    // Add personalized suggestions based on data
    if (flashcards.length > 0) {
      aiSuggestions.push({
        icon: '🎲',
        title: 'Smart Study Strategy',
        message: 'Mix up your flashcard subjects every 20 minutes to improve retention through interleaving - your brain will thank you!',
        type: 'strategy'
      });
    }
    
    // Default suggestions if none exist
    if (aiSuggestions.length === 0) {
      aiSuggestions.push(
        {
          icon: '📅',
          title: 'Optimal Study Time',
          message: `Your productivity peaks during ${currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'} hours. Schedule your most challenging tasks during this time!`,
          type: 'insight'
        },
        {
          icon: '🎯',
          title: 'Retention Booster',
          message: 'Review material within 24 hours of first learning it to increase retention by up to 60%. Science-backed learning!',
          type: 'tip'
        }
      );
    }

    content += `
      <div style="margin-bottom: 32px;">
        <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 22px; font-weight: 800; display: flex; align-items: center;">
          <span style="margin-right: 12px; font-size: 24px;">🤖</span> AI Learning Coach
        </h2>
        <div style="background: linear-gradient(135deg, ${mintLight} 0%, #F0FDF4 100%); border: 2px solid ${mintPrimary}; padding: 28px; border-radius: 20px; margin: 16px 0; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.15);">
          <h4 style="margin: 0 0 24px 0; color: ${grayDark}; font-size: 20px; font-weight: 700;">💡 Personalized Learning Insights</h4>
          
          ${aiSuggestions.map((suggestion: any, index: number) => `
            <div style="background: ${suggestion.type === 'achievement' ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' : suggestion.type === 'urgent' ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : suggestion.type === 'important' ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'white'}; border-left: 6px solid ${suggestion.type === 'achievement' ? '#10B981' : suggestion.type === 'urgent' ? '#EF4444' : suggestion.type === 'important' ? '#F59E0B' : mintPrimary}; padding: 20px; margin: 16px 0; border-radius: 0 16px 16px 0; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
              <div style="display: flex; align-items: flex-start; gap: 16px;">
                <span style="font-size: 28px; margin-top: 4px;">${suggestion.icon}</span>
                <div>
                  <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 16px; font-weight: 700;">${suggestion.title}</p>
                  <p style="margin: 0; color: ${grayMedium}; font-size: 15px; line-height: 1.6;">${suggestion.message}</p>
                </div>
              </div>
            </div>
          `).join('')}
          
          <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.5);">
            <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 16px;">
              <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 16px; font-weight: 700;">⚡ Today's Quick Win Challenge:</p>
              <p style="margin: 0; color: ${grayMedium}; font-size: 15px; line-height: 1.6;">Complete a 15-minute focused study session to build momentum. Small consistent actions create extraordinary results!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Enhanced Call-to-Action Section with Multiple Actions
    content += `
          <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 3px solid ${mintLight};">
            <h3 style="color: ${grayDark}; font-size: 20px; font-weight: 700; margin: 0 0 24px 0;">🚀 Ready to Level Up Your Learning?</h3>
            
            <div style="margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
              <a href="${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${mintPrimary} 0%, ${mintDark} 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.4); margin: 4px;">📊 Dashboard</a>
              
              ${flashcards.length > 0 ? `<a href="${siteUrl}/flashcards" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4); margin: 4px;">🧠 Review Cards</a>` : ''}
              
              ${prioritizedTodos.length > 0 ? `<a href="${siteUrl}/reminders" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4); margin: 4px;">✅ Complete Tasks</a>` : ''}
              
              ${goals.length > 0 ? `<a href="${siteUrl}/goals" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4); margin: 4px;">🎯 Track Goals</a>` : ''}
            </div>
            
            <p style="margin: 20px 0 0 0; color: ${grayMedium}; font-size: 16px; line-height: 1.6; font-weight: 500;">Your personalized learning journey awaits! Every small step counts towards your bigger goals. 🌟</p>
            
            ${studyStreak && studyStreak.days >= 3 ? `
              <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; padding: 20px; border-radius: 16px; margin: 24px 0; text-align: center; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);">
                <span style="font-size: 32px; margin-bottom: 8px; display: block;">🎉</span>
                <p style="margin: 0; color: #92400E; font-size: 18px; font-weight: 700;">Streak Celebration!</p>
                <p style="margin: 8px 0 0 0; color: #B45309; font-size: 14px; font-weight: 500;">You're absolutely crushing it with ${studyStreak.days} days of consistent learning! The compound effect is real! 🚀</p>
              </div>
            ` : ''}
          </div>
          
          <!-- Footer with Enhanced Links -->
          <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: ${grayMedium}; font-size: 13px; line-height: 1.6;">
              You're receiving this personalized digest because daily notifications are enabled.<br>
              <a href="${siteUrl}/settings" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">⚙️ Customize Preferences</a> | 
              <a href="${siteUrl}/help" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">❓ Get Support</a> |
              <a href="${siteUrl}/achievements" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">🏆 View Achievements</a> |
              <a href="${siteUrl}/community" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">👥 Join Community</a>
            </p>
            <p style="margin: 16px 0 0 0; color: ${grayMedium}; font-size: 11px;">© ${new Date().getFullYear()} ${brandName} - Your AI-Powered Learning Companion</p>
            <p style="margin: 4px 0 0 0; color: ${grayMedium}; font-size: 10px;">Empowering learners worldwide with personalized, intelligent study experiences 🌍</p>
          </div>
        </div>
      </div>
    `;

    // Enhanced Plain-text alternative for better deliverability
    const textParts: string[] = [];
    textParts.push(`${brandName} — Daily Learning Digest (${currentDate})`);
    textParts.push(`${greeting} ${displayName}!`);
    textParts.push('');
    
    if (studyStreak && studyStreak.days > 0) {
      textParts.push(`🔥 AMAZING! You're on a ${studyStreak.days}-day study streak!`);
      textParts.push('');
    }
    
    if (todos.length) {
      const overdueCount = prioritizedTodos.filter((todo: any) => todo.due_date && new Date(todo.due_date) < new Date()).length;
      textParts.push(`✅ Todos: ${todos.length}${overdueCount > 0 ? ` (${overdueCount} overdue - needs attention!)` : ''}`);
    }
    
    if (flashcards.length) textParts.push(`🧠 Flashcards ready for review: ${flashcards.length}`);
    if (quizzes.length) textParts.push(`🎯 Available quizzes: ${quizzes.length}`);
    if (goals.length) {
      const overdueGoals = goals.filter((goal: any) => goal.end_date && new Date(goal.end_date) < new Date()).length;
      textParts.push(`🎯 Active goals: ${goals.length}${overdueGoals > 0 ? ` (${overdueGoals} overdue)` : ''}`);
    }
    
    if (sessions.length) {
      const minutes = Math.round(sessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) / 60);
      textParts.push(`📊 Study time this week: ${minutes} minutes across ${sessions.length} session(s)`);
    }
    
    if (reminders.length) textParts.push(`🔔 Reminders: ${reminders.length}`);
    
    textParts.push('');
    textParts.push('🚀 Quick Actions:');
    textParts.push(`• Open Dashboard: ${siteUrl}/dashboard`);
    if (flashcards.length > 0) textParts.push(`• Review Flashcards: ${siteUrl}/flashcards`);
    if (prioritizedTodos.length > 0) textParts.push(`• Complete Tasks: ${siteUrl}/reminders`);
    
    textParts.push('');
    textParts.push(`⚙️ Manage preferences: ${siteUrl}/settings`);
    textParts.push(`❓ Get help: ${siteUrl}/help`);
    textParts.push(`🏆 View achievements: ${siteUrl}/achievements`);

    const textContent = textParts.join('\n');

    // Send enhanced email with Resend
    const emailResponse = await resend.emails.send({
      from: `${brandName} Learning Coach <digest@${siteUrl.replace('https://', '').replace('http://', '')}>`,
      to: [userEmail],
      subject: `${greeting} ${displayName}! Your ${brandName} digest${studyStreak && studyStreak.days > 0 ? ` 🔥 ${studyStreak.days}-day streak!` : ''} - ${currentDate}`,
      html: content,
      text: textContent,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal'
      }
    });

    if (emailResponse.error) {
      console.error('❌ Email send error:', emailResponse.error);
      throw new Error(`Failed to send digest email: ${emailResponse.error.message || emailResponse.error}`);
    }

    console.log('✅ Enhanced daily digest sent successfully:', {
      recipient: userEmail,
      emailId: emailResponse.data?.id,
      studyStreak: studyStreak ? studyStreak.days : 0,
      todos: todos.length,
      flashcards: flashcards.length,
      goals: goals.length,
      achievements: achievements.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        features: {
          logo: true,
          personalizedGreeting: true,
          studyStreak: studyStreak ? studyStreak.days : 0,
          achievements: achievements.length,
          smartPrioritization: true,
          aiInsights: aiSuggestions.length,
          interactiveButtons: true,
          mobileOptimized: true
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Enhanced digest email error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});