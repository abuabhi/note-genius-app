
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
    const { to, subject, message, noteTitle, contentType, content } = await req.json();
    
    if (!to || !noteTitle || !content) {
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
    const emailSubject = subject || `Note: ${noteTitle} - ${contentType}`;
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #4db6ac; border-bottom: 2px solid #4db6ac; padding-bottom: 10px; }
          h2 { color: #26a69a; }
          .content { 
            white-space: pre-wrap; 
            margin: 20px 0; 
            padding: 20px; 
            background-color: #f8f9fa; 
            border-left: 4px solid #4db6ac; 
            border-radius: 4px;
          }
          .message { 
            background-color: #e8f5e8; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            border: 1px solid #4db6ac;
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
        <h1>${noteTitle}</h1>
        <h2>${contentType}</h2>
        
        ${message ? `<div class="message"><strong>Personal Message:</strong><br>${message}</div>` : ''}
        
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
        
        <div class="footer">
          This note was shared from PrepGenie - Your Smart Study Companion
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "PrepGenie <noreply@prepgenie.app>", // You may need to update this with your verified domain
      to: [to],
      subject: emailSubject,
      html: emailBody,
    });

    console.log("Email sent successfully:", emailResponse);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
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
    console.error("Error in send-note-email function:", error);
    
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
