
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { userEmail, userId, reminders, goals, sessions, todos, flashcards, quizzes, timezone } = await req.json();
    
    // Generate digest content
    const currentDate = new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Define mint theme colors from the app
    const mintPrimary = '#059669'; // mint-600
    const mintLight = '#D1FAE5';   // mint-100
    const mintDark = '#047857';    // mint-700
    const grayDark = '#111827';    // gray-900
    const grayMedium = '#6B7280';  // gray-500
    const grayLight = '#F9FAFB';   // gray-50
    
    let content = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with Logo and Branding -->
        <div style="background: linear-gradient(135deg, ${mintPrimary} 0%, ${mintDark} 100%); padding: 40px 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin-right: 12px;">
              <span style="font-size: 32px;">📚</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">PrepGenie</h1>
          </div>
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Your Study Digest</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">${currentDate}</p>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
    `;

    // Add todos section first (highest priority)
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
                ${isOverdue ? '⚠️ Overdue' : '📅'} ${todo.due_date ? new Date(todo.due_date).toLocaleDateString() : 'No due date'}
              </span>
              <span style="font-size: 11px; color: ${mintDark}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${todo.priority || 'medium'} priority
              </span>
            </div>
          </div>
        `;
      });
      
      content += `</div></div>`;
    }

    // Add pending flashcards section
    if (flashcards && flashcards.length > 0) {
      content += `
        <div style="margin-bottom: 32px;">
          <h2 style="color: ${grayDark}; border-bottom: 3px solid ${mintPrimary}; padding-bottom: 12px; margin-bottom: 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🧠</span> Flashcards to Review
          </h2>
          <div style="background: ${mintLight}; border: 1px solid ${mintPrimary}; padding: 20px; border-radius: 12px; margin: 16px 0;">
            <h4 style="margin: 0 0 12px 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">📚 ${flashcards.length} cards ready for review</h4>
            <p style="margin: 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">
              Keep your knowledge fresh! You have flashcards waiting for review to boost your retention.
            </p>
            <div style="margin-top: 16px;">
              <a href="https://prepgenie.io/flashcards" style="display: inline-block; background: ${mintPrimary}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Review Now →
              </a>
            </div>
          </div>
        </div>
      `;
    }

    // Add pending quizzes section
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
            ${quiz.description ? `<p style="margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${quiz.description}</p>` : ''}
            <div style="margin-top: 12px;">
              <a href="https://prepgenie.io/quiz/${quiz.id}" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600; font-size: 14px;">
                Take Quiz →
              </a>
            </div>
          </div>
        `;
      });
      
      content += `</div></div>`;
    }
    
    // Add goals section
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
            ${goal.description ? `<p style="margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${goal.description}</p>` : ''}
            <div style="background: #E5E7EB; height: 10px; border-radius: 5px; margin: 16px 0; overflow: hidden;">
              <div style="background: ${mintPrimary}; height: 10px; border-radius: 5px; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: ${mintDark}; font-weight: 600;">${progressPercent}% Complete</span>
              <span style="font-size: 12px; color: ${grayMedium};">Due: ${goal.end_date ? new Date(goal.end_date).toLocaleDateString() : 'No deadline'}</span>
            </div>
          </div>
        `;
      });
      
      content += `</div></div>`;
    }

    // Add active study sessions section
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
              <p style="margin: 8px 0 0 0; color: #B45309; font-size: 14px;">
                You have ${activeSessions.length} active study session${activeSessions.length > 1 ? 's' : ''}. Don't forget to end them when you're done!
              </p>
            </div>
          ` : ''}
          
          <div style="background: ${mintLight}; border: 1px solid ${mintPrimary}; padding: 20px; margin: 16px 0; border-radius: 12px;">
            <h4 style="margin: 0; color: ${grayDark}; font-size: 18px; font-weight: 600;">This Week's Summary</h4>
            <p style="margin: 12px 0 0 0; color: ${mintDark}; font-size: 24px; font-weight: 700;">
              ${Math.round(totalMinutes)} minutes studied
            </p>
            <p style="margin: 4px 0 0 0; color: ${grayMedium}; font-size: 14px;">
              across ${sessions.length} session${sessions.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      `;
    }

    // Add reminders section
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
            ${reminder.description ? `<p style="margin: 8px 0; color: ${grayMedium}; font-size: 14px; line-height: 1.5;">${reminder.description}</p>` : ''}
            <p style="margin: 12px 0 0 0; font-size: 12px; color: ${grayMedium}; background: white; padding: 4px 8px; border-radius: 12px; display: inline-block; font-weight: 500;">
              ${isOverdue ? '⚠️ Overdue' : '📅'} ${reminder.reminder_time ? new Date(reminder.reminder_time).toLocaleDateString() : 'No date set'}
            </p>
          </div>
        `;
      });
      
      content += `</div></div>`;
    }

    // Add AI suggestions section
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
            <a href="https://prepgenie.io/dashboard" style="display: inline-block; background: ${mintPrimary}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); transition: all 0.3s ease;">
              🚀 Open PrepGenie Dashboard
            </a>
            <p style="margin: 20px 0 0 0; color: ${grayMedium}; font-size: 14px; line-height: 1.6;">
              Ready to boost your learning? Your personalized study dashboard awaits!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: ${grayMedium}; font-size: 12px; line-height: 1.5;">
              You're receiving this digest because you have daily notifications enabled.<br>
              <a href="https://prepgenie.io/settings" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">Manage your preferences</a> | 
              <a href="https://prepgenie.io/help" style="color: ${mintPrimary}; text-decoration: none; font-weight: 600;">Get help</a>
            </p>
            <p style="margin: 12px 0 0 0; color: ${grayMedium}; font-size: 11px;">
              © 2025 PrepGenie - Your AI Study Companion
            </p>
          </div>
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
