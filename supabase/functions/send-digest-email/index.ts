
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { userEmail, userId, reminders, goals, sessions, timezone } = await req.json();
    
    // Generate digest content
    const currentDate = new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let content = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📚 Your Study Digest</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${currentDate}</p>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    `;
    
    // Add reminders section
    if (reminders && reminders.length > 0) {
      content += `
        <h2 style="color: #1F2937; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px;">🔔 Your Reminders</h2>
        <div style="margin: 16px 0;">
      `;
      
      reminders.slice(0, 5).forEach((reminder: any) => {
        const isOverdue = reminder.reminder_time && new Date(reminder.reminder_time) < new Date();
        content += `
          <div style="background: ${isOverdue ? '#FEF2F2' : '#F9FAFB'}; border-left: 4px solid ${isOverdue ? '#EF4444' : '#3B82F6'}; padding: 12px; margin: 8px 0; border-radius: 0 4px 4px 0;">
            <h4 style="margin: 0; color: #1F2937; font-size: 16px;">${reminder.title}</h4>
            ${reminder.description ? `<p style="margin: 4px 0; color: #6B7280; font-size: 14px;">${reminder.description}</p>` : ''}
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #9CA3AF;">
              ${isOverdue ? '⚠️ Overdue' : '📅'} ${reminder.reminder_time ? new Date(reminder.reminder_time).toLocaleDateString() : 'No date set'}
            </p>
          </div>
        `;
      });
      
      content += `</div>`;
    }
    
    // Add goals section
    if (goals && goals.length > 0) {
      content += `
        <h2 style="color: #1F2937; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin-top: 24px;">🎯 Your Goals</h2>
        <div style="margin: 16px 0;">
      `;
      
      goals.slice(0, 3).forEach((goal: any) => {
        const progressPercent = goal.progress || 0;
        content += `
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 16px; margin: 8px 0; border-radius: 6px;">
            <h4 style="margin: 0; color: #1F2937; font-size: 16px;">${goal.title}</h4>
            ${goal.description ? `<p style="margin: 4px 0; color: #6B7280; font-size: 14px;">${goal.description}</p>` : ''}
            <div style="background: #E5E7EB; height: 8px; border-radius: 4px; margin: 8px 0;">
              <div style="background: #3B82F6; height: 8px; border-radius: 4px; width: ${progressPercent}%;"></div>
            </div>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #9CA3AF;">
              Progress: ${progressPercent}% • Due: ${goal.end_date ? new Date(goal.end_date).toLocaleDateString() : 'No deadline'}
            </p>
          </div>
        `;
      });
      
      content += `</div>`;
    }
    
    // Add recent sessions section
    if (sessions && sessions.length > 0) {
      const totalMinutes = sessions.reduce((acc: number, session: any) => acc + (session.duration || 0), 0) / 60;
      content += `
        <h2 style="color: #1F2937; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin-top: 24px;">📊 Recent Activity</h2>
        <div style="background: #F0F9FF; border: 1px solid #BAE6FD; padding: 16px; margin: 16px 0; border-radius: 6px;">
          <h4 style="margin: 0; color: #1F2937;">This Week's Summary</h4>
          <p style="margin: 8px 0 0 0; color: #3B82F6; font-size: 18px; font-weight: bold;">
            ${Math.round(totalMinutes)} minutes studied across ${sessions.length} sessions
          </p>
        </div>
      `;
    }
    
    content += `
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <a href="https://prepgenie.io/dashboard" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Open PrepGenie Dashboard
            </a>
          </div>
          
          <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 24px;">
            You're receiving this because you have daily digest enabled. 
            <a href="https://prepgenie.io/settings" style="color: #3B82F6;">Update preferences</a>
          </p>
        </div>
      </div>
    `;
    
    const { data, error } = await resend.emails.send({
      from: "PrepGenie <noreply@prepgenie.io>",
      to: [userEmail],
      subject: `📚 Your Daily Study Digest - ${currentDate}`,
      html: content,
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
    
  } catch (error) {
    console.error('❌ Error in send-digest-email:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
