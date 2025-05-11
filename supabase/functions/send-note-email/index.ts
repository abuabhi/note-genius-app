
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { noteTitle, noteContent, recipient } = await req.json();
    
    if (!noteTitle || !noteContent) {
      return new Response(
        JSON.stringify({ error: "Missing required note data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Format the email content
    const subject = `Note: ${noteTitle}`;
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #4f46e5; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .content { white-space: pre-wrap; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${noteTitle}</h1>
          <div class="content">${noteContent.replace(/\n/g, '<br>')}</div>
          <div class="footer">
            This note was shared from Study Notes App.
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("Email would be sent with subject:", subject);
    console.log("Recipient:", recipient || "Not specified");
    
    // For demonstration purposes, we'll return success
    // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email prepared successfully",
        // In a real implementation, you would return the response from the email service
        emailData: {
          subject,
          recipient,
          recipientCount: recipient ? 1 : 0,
          contentLength: emailBody.length,
          status: "sent"
        }
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in send-note-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process email request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
