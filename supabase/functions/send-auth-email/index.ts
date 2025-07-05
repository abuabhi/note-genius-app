import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

// Ultra-minimal HTML email template
const createMinimalEmail = (confirmationUrl: string, userEmail: string): string => {
  return `
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3dc087;">PrepGenie</h1>
    <p>Welcome! Please confirm your email to get started.</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${confirmationUrl}" 
       style="background-color: #3dc087; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Confirm Your Account
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px;">
    If the button doesn't work, copy this link: ${confirmationUrl}
  </p>
</body>
</html>`;
};

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
    
    // Basic validation only
    if (!user?.email || !email_data?.token_hash || email_data.email_action_type !== "signup") {
      return new Response("Invalid request", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;
    const html = createMinimalEmail(confirmationUrl, user.email);

    // Direct Resend API call using fetch - fastest method
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PrepGenie <noreply@resend.dev>",
        to: [user.email],
        subject: "Confirm Your PrepGenie Account",
        html
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    console.log("✅ Email sent successfully to:", user.email);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Email send error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);