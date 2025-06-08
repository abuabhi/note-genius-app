
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackNotificationRequest {
  type: 'thank_you' | 'admin_notification' | 'admin_response';
  feedbackId: string;
  userEmail?: string;
  adminResponse?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, feedbackId, userEmail, adminResponse }: FeedbackNotificationRequest = await req.json();

    // Get feedback details
    const { data: feedback, error: feedbackError } = await supabaseClient
      .from('feedback')
      .select('*, profiles!feedback_user_id_fkey(username)')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      throw new Error('Feedback not found');
    }

    // Get user email if not provided
    let recipientEmail = userEmail;
    if (!recipientEmail) {
      const { data: emailData } = await supabaseClient.rpc('get_user_email_for_feedback', {
        feedback_user_id: feedback.user_id
      });
      recipientEmail = emailData;
    }

    if (!recipientEmail) {
      throw new Error('User email not found');
    }

    // For now, we'll log the email content instead of sending
    // User needs to set up Resend API key for actual email sending
    let emailContent = '';
    let subject = '';

    switch (type) {
      case 'thank_you':
        subject = 'Thank you for your feedback!';
        emailContent = `
          <h1>Thank you for your feedback!</h1>
          <p>Dear ${feedback.profiles?.username || 'User'},</p>
          <p>We have received your ${feedback.type} feedback titled "${feedback.title}" and appreciate you taking the time to help us improve.</p>
          <p>Our team will review your feedback and get back to you if needed.</p>
          <p>Best regards,<br>The Study Platform Team</p>
        `;
        break;
      
      case 'admin_notification':
        subject = 'New Feedback Received';
        emailContent = `
          <h1>New Feedback Received</h1>
          <p>A new ${feedback.type} feedback has been submitted:</p>
          <p><strong>Title:</strong> ${feedback.title}</p>
          <p><strong>Type:</strong> ${feedback.type}</p>
          <p><strong>Priority:</strong> ${feedback.priority}</p>
          <p><strong>User:</strong> ${feedback.profiles?.username || 'Unknown'}</p>
          <p><strong>Description:</strong> ${feedback.description || 'No description provided'}</p>
          <p>Please review and respond in the admin panel.</p>
        `;
        break;
      
      case 'admin_response':
        subject = 'Response to your feedback';
        emailContent = `
          <h1>Response to your feedback</h1>
          <p>Dear ${feedback.profiles?.username || 'User'},</p>
          <p>We have reviewed your feedback titled "${feedback.title}" and here's our response:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${adminResponse}
          </div>
          <p>Thank you for helping us improve our platform!</p>
          <p>Best regards,<br>The Study Platform Team</p>
        `;
        break;
    }

    // Log email content (replace with actual email sending when Resend is configured)
    console.log('Email would be sent to:', recipientEmail);
    console.log('Subject:', subject);
    console.log('Content:', emailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification logged (configure Resend API key for actual sending)',
        recipientEmail,
        subject
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-feedback-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
