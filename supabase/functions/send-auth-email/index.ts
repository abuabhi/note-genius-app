import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ConfirmationEmail } from "./_templates/confirmation-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    email: string;
    id: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { user, email_data }: AuthEmailRequest = await req.json();
    
    console.log("🔐 [AUTH EMAIL] Processing auth email for:", user.email);
    console.log("🔐 [AUTH EMAIL] Email action type:", email_data.email_action_type);

    // Only handle signup confirmations
    if (email_data.email_action_type !== "signup") {
      return new Response("Not a signup confirmation", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Generate the confirmation URL
    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

    // Render the React email template
    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        confirmationUrl,
        userEmail: user.email,
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "PrepGenie <noreply@resend.dev>", // Will be updated to custom domain later
      to: [user.email],
      subject: "Welcome to PrepGenie - Confirm Your Account",
      html,
    });

    console.log("🔐 [AUTH EMAIL] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("🔐 [AUTH EMAIL] Error sending auth email:", error);
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