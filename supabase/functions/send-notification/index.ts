
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { userId, type, subject, body, reminderData } = await req.json();
    
    if (!userId || !type || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key to access auth.users
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user email from auth.users table
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user?.email) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found or no email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userEmail = user.email;
    console.log(`Sending ${type} notification to: ${userEmail}`);

    if (type === 'email') {
      // Generate HTML email content based on reminder type
      const htmlContent = generateEmailHtml(subject, body, reminderData);
      
      const emailResponse = await resend.emails.send({
        from: "PrepGenie <noreply@prepgenie.io>",
        to: [userEmail],
        subject: subject,
        html: htmlContent,
      });

      if (emailResponse.error) {
        console.error('Resend error:', emailResponse.error);
        throw new Error(`Email sending failed: ${emailResponse.error.message}`);
      }

      console.log('Email sent successfully:', emailResponse.data?.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email notification sent successfully',
          emailId: emailResponse.data?.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'whatsapp') {
      // WhatsApp implementation would go here
      console.log('WhatsApp notification requested but not implemented yet');
      return new Response(
        JSON.stringify({ success: true, message: 'WhatsApp notification logged (not implemented)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'in_app') {
      // In-app notifications are handled by status updates in the database
      return new Response(
        JSON.stringify({ success: true, message: 'In-app notification processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported notification type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-notification function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailHtml(subject: string, body: string, reminderData: any): string {
  const reminderType = reminderData?.type || 'reminder';
  const dueDate = reminderData?.due_date ? new Date(reminderData.due_date).toLocaleDateString() : null;
  const priority = reminderData?.priority || 'normal';
  
  // Color scheme based on priority
  const priorityColors = {
    low: '#10B981', // green
    normal: '#3B82F6', // blue
    high: '#F59E0B', // amber
    urgent: '#EF4444' // red
  };
  
  const accentColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            🎓 PrepGenie Reminder
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
            ${subject}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <div style="background-color: #f8fafc; border-left: 4px solid ${accentColor}; padding: 16px 20px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
            <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
              ${body}
            </p>
          </div>
          
          ${dueDate ? `
          <div style="margin-bottom: 24px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              📅 <strong>Due Date:</strong> ${dueDate}
            </p>
          </div>
          ` : ''}
          
          ${priority !== 'normal' ? `
          <div style="margin-bottom: 24px;">
            <span style="display: inline-block; background-color: ${accentColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${priority} Priority
            </span>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://prepgenie.io/dashboard" 
               style="display: inline-block; background-color: ${accentColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Open PrepGenie Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            This reminder was sent from <strong>PrepGenie</strong> - Your AI Study Companion
          </p>
          <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
            You're receiving this because you have active reminders set up in your account.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
