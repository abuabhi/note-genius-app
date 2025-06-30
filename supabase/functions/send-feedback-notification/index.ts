
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackNotificationRequest {
  type: 'thank_you' | 'admin_notification' | 'admin_response' | 'external_feedback';
  feedbackId?: string;
  userEmail?: string;
  adminResponse?: string;
  feedbackData?: any;
  supportEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, feedbackId, userEmail, adminResponse, feedbackData, supportEmail }: FeedbackNotificationRequest = await req.json();

    let emailContent = '';
    let subject = '';
    let recipientEmail = '';

    if (type === 'external_feedback') {
      // Handle external feedback forwarding
      if (!supportEmail || !feedbackData) {
        throw new Error('Support email and feedback data required for external forwarding');
      }

      // Get user profile info
      let userInfo = 'Unknown User';
      if (feedbackData.user_id) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('username')
          .eq('id', feedbackData.user_id)
          .single();
        
        userInfo = profile?.username || 'Unknown User';
      }

      recipientEmail = supportEmail;
      subject = `New ${feedbackData.type.replace('_', ' ')} Feedback - ${feedbackData.title}`;
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0; font-size: 28px;">New Feedback Received</h1>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Type:</strong> <span style="color: #059669; text-transform: uppercase;">${feedbackData.type.replace('_', ' ')}</span></p>
              <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${feedbackData.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>User:</strong> ${userInfo}</p>
              ${feedbackData.priority ? `<p style="margin: 0 0 10px 0;"><strong>Priority:</strong> <span style="color: #dc2626; text-transform: uppercase;">${feedbackData.priority}</span></p>` : ''}
              ${feedbackData.severity ? `<p style="margin: 0 0 10px 0;"><strong>Severity:</strong> <span style="color: #dc2626; text-transform: uppercase;">${feedbackData.severity}</span></p>` : ''}
              ${feedbackData.rating ? `<p style="margin: 0;"><strong>Rating:</strong> ${feedbackData.rating}/5 ⭐</p>` : ''}
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 10px;">Description:</h3>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #059669;">
                ${feedbackData.description || 'No description provided'}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">This feedback was automatically forwarded from PrepGenie</p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Handle existing notification types
      let feedback = null;
      if (feedbackId) {
        const { data: feedbackData, error: feedbackError } = await supabaseClient
          .from('feedback')
          .select('*, profiles!feedback_user_id_fkey(username)')
          .eq('id', feedbackId)
          .single();

        if (feedbackError || !feedbackData) {
          throw new Error('Feedback not found');
        }
        feedback = feedbackData;
      }

      // Get user email if not provided
      recipientEmail = userEmail;
      if (!recipientEmail && feedback) {
        const { data: emailData } = await supabaseClient.rpc('get_user_email_for_feedback', {
          feedback_user_id: feedback.user_id
        });
        recipientEmail = emailData;
      }

      if (!recipientEmail && type !== 'admin_notification') {
        throw new Error('User email not found');
      }

      switch (type) {
        case 'thank_you':
          subject = 'Thank you for your feedback! 🎉';
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #059669; margin: 0 0 10px 0; font-size: 28px;">Thank You!</h1>
                  <p style="color: #6b7280; font-size: 16px; margin: 0;">We received your feedback</p>
                </div>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Dear ${feedback?.profiles?.username || 'Valued User'},</p>
                  <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">We have received your <strong>${feedback?.type}</strong> feedback titled "<em>${feedback?.title}</em>" and truly appreciate you taking the time to help us improve PrepGenie.</p>
                  <p style="margin: 0; color: #374151; line-height: 1.6;">Our team will carefully review your feedback and get back to you if needed. Your input helps us make PrepGenie better for everyone!</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://prepgenie.com/feedback" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Share More Feedback</a>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">Best regards,<br><strong>The PrepGenie Team</strong></p>
                </div>
              </div>
            </div>
          `;
          break;
        
        case 'admin_notification':
          // This would typically go to admin email - for now we'll log it
          console.log('Admin notification for feedback:', feedbackId);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Admin notification logged (configure admin email for actual sending)'
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        
        case 'admin_response':
          subject = 'Response to your feedback 📬';
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #059669; margin: 0 0 10px 0; font-size: 28px;">We've Responded!</h1>
                  <p style="color: #6b7280; font-size: 16px; margin: 0;">Here's our response to your feedback</p>
                </div>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Dear ${feedback?.profiles?.username || 'Valued User'},</p>
                  <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">Thank you for your feedback titled "<em>${feedback?.title}</em>". We've carefully reviewed it and here's our response:</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                  <h3 style="color: #92400e; margin: 0 0 10px 0;">Our Response:</h3>
                  <div style="color: #374151; line-height: 1.6;">${adminResponse}</div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://prepgenie.com/feedback" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Continue the Conversation</a>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">Thank you for helping us improve PrepGenie!<br><strong>The PrepGenie Team</strong></p>
                </div>
              </div>
            </div>
          `;
          break;
      }
    }

    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: "PrepGenie <hello@prepgenie.io>",
      to: [recipientEmail],
      subject: subject,
      html: emailContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailResponse.data?.id,
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
