
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, chatHistory, noteTitle } = await req.json();
    
    if (!to || !chatHistory || !noteTitle) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!to.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Format the email content
    const emailSubject = subject || `Chat History for "${noteTitle}"`;
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          .chat-container { margin: 20px 0; }
          .message { 
            margin: 15px 0; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #10b981;
          }
          .user-message { 
            background-color: #f0fdf4; 
            border-left-color: #22c55e;
          }
          .ai-message { 
            background-color: #f8fafc; 
            border-left-color: #10b981;
          }
          .message-header { 
            font-weight: bold; 
            margin-bottom: 8px; 
            font-size: 14px;
          }
          .message-content { 
            white-space: pre-wrap; 
            word-wrap: break-word;
          }
          .timestamp { 
            font-size: 12px; 
            color: #666; 
            margin-top: 8px;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #777; 
            border-top: 1px solid #ddd; 
            padding-top: 10px; 
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Chat History: ${noteTitle}</h1>
        <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>
        
        <div class="chat-container">
          ${chatHistory}
        </div>
        
        <div class="footer">
          This chat history was exported from PrepGenie - Your Smart Study Companion
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "PrepGenie <noreply@prepgenie.app>",
      to: [to],
      subject: emailSubject,
      html: emailBody,
    });

    console.log("Chat email sent successfully:", emailResponse);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Chat history sent successfully",
        emailData: {
          subject: emailSubject,
          recipient: to,
          status: "sent",
          timestamp: new Date().toISOString(),
          id: emailResponse.data?.id
        }
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in send-chat-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        details: "Please check your email configuration and try again"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
