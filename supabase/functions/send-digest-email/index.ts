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
    const logoUrl = Deno.env.get('BRAND_LOGO_URL'); // Full URL to a hosted logo image (PNG/SVG)

    // Supabase client for fetching profile name
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const toTitleCase = (s: string) => s.split(/[\s._-]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    let firstName: string | null = null;
    let username: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, username')
        .eq('id', userId)
        .maybeSingle();
      firstName = (profile as any)?.first_name ?? null;
      username = (profile as any)?.username ?? null;
    }
    const emailLocal = (userEmail || '').split('@')[0] || 'there';
    const displayName = (firstName && firstName.trim()) || (username && toTitleCase(username.trim())) || toTitleCase(emailLocal);

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

    // Todos (priority)
    if (todos && todos.length > 0) {
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">✅</span> Your Todos
          </h2>
          <div style="margin: 16px 0;">
      `;
      todos.slice(0, 5).forEach((todo: any) => {
        const isOverdue = todo.due_date && new Date(todo.due_date) < new Date();
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : mintLight}; border-left: 4px solid ${isOverdue ? '#EF4444' : mintPrimary}; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 16px; font-weight: 600;">${todo.title}</h4>
            ${todo.description ? `<p style="margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${todo.description}</p>` : ''}
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;">
              <span style="font-size: 12px; color: ${grayMedium}; background: white; padding: 4px 8px; border-radius: 12px; font-weight: 500;">
                ${isOverdue ? '⚠️ Overdue' : '📅'} ${todo.due_date ? fmtDate(todo.due_date) : 'No due date'}
              </span>
              <span style="font-size: 11px; color: ${mintDark}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${(todo.priority || 'medium')} priority
              </span>
            </div>
          </div>
        `;
      });
      content += `</div></div>`;
    }

    // Flashcards
    if (flashcards && flashcards.length > 0) {
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🧠</span> Flashcards to Review
          </h2>
          <div style="background: ${mintLight}; border: 1px solid ${mintPrimary}; padding: 20px; border-radius: 12px; margin: 16px 0;">
            <h4 style="margin: 0 0 12px 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">📚 ${flashcards.length} cards ready for review</h4>
            <p style="margin: 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">Keep your knowledge fresh! You have flashcards waiting for review to boost your retention.</p>
            <div style="margin-top: 16px;">
              <a href="${siteUrl}/flashcards" style="display: inline-block; background: ${mintPrimary}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Review Now →</a>
            </div>
          </div>
        </div>
      `;
    }

    // Quizzes
    if (quizzes && quizzes.length > 0) {
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🎯</span> Available Quizzes
          </h2>
          <div style="margin: 16px 0;">
      `;
      quizzes.slice(0, 3).forEach((quiz: any) => {
        content += `
          <div style="background: ${grayLight}; border: 1px solid #E5E7EB; padding: 16px; margin: 12px 0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 16px; font-weight: 600;">${quiz.title}</h4>
            ${quiz.description ? `<p style=\"margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;\">${quiz.description}</p>` : ''}
            <div style="margin-top: 12px;">
              <a href="${siteUrl}/quiz/${quiz.id}" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600; font-size: 14px;">Take Quiz →</a>
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
        content += `
          <div style="background: ${grayLight}; border: 1px solid #E5E7EB; padding: 20px; margin: 12px 0; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 16px; font-weight: 600;">${goal.title}</h4>
            ${goal.description ? `<p style=\"margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;\">${goal.description}</p>` : ''}
            <div style="background: #E5E7EB; height: 10px; border-radius: 5px; margin: 16px 0; overflow: hidden;">
              <div style="background: ${mintPrimary}; height: 10px; border-radius: 5px; width: ${progressPercent}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: ${mintDark}; font-weight: 600;">${progressPercent}% Complete</span>
              <span style="font-size: 12px; color: ${grayMedium};">Due: ${fmtDate(goal.end_date)}</span>
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

    // AI suggestions (static for now)
    content += `
      <div style="margin-bottom: 32px;">
        <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
          <span style="margin-right: 8px;">🤖</span> AI Study Suggestions
        </h2>
        <div style="background: linear-gradient(135deg, ${mintLight} 0%, #F0FDF4 100%); border: 1px solid ${mintPrimary}; padding: 24px; border-radius: 16px; margin: 16px 0;">
          <h4 style="margin: 0 0 16px 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">💡 Smart Study Tips</h4>
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">📅 Best Study Time:</p>
            <p style="margin: 0; color: ${grayMedium}; font-size: 14px;">Based on your activity, you're most productive around ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} hours.</p>
          </div>
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">🎯 Focus Areas:</p>
            <p style="margin: 0; color: ${grayMedium}; font-size: 14px;">Review flashcards that haven't been studied in the last 3 days for better retention.</p>
          </div>
          <div>
            <p style="margin: 0 0 8px 0; color: ${grayDark}; font-size: 14px; font-weight: 600;">⚡ Quick Win:</p>
            <p style="margin: 0; color: ${grayMedium}; font-size: 14px;">Complete a 15-minute focused study session to maintain your learning momentum.</p>
          </div>
        </div>
      </div>
    `;

    content += `
          <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 2px solid ${mintLight};">
            <a href="${siteUrl}/dashboard" style="display: inline-block; background: ${mintPrimary}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">🚀 Open ${brandName} Dashboard</a>
            <p style="margin: 20px 0 0 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">Ready to boost your learning? Your personalized study dashboard awaits!</p>
          </div>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: ${grayMedium}; font-size: 12px; line-height: 1.5;">
              You're receiving this digest because you have daily notifications enabled.<br>
              <a href="${siteUrl}/settings" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">Manage your preferences</a> | 
              <a href="${siteUrl}/help" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">Get help</a>
            </p>
            <p style="margin: 12px 0 0 0; color: ${grayMedium}; font-size: 11px;">© ${new Date().getFullYear()} ${brandName}</p>
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
