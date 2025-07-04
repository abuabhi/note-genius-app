import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { 
  checkRateLimit, 
  sanitizeEmail, 
  validateEmailFormat, 
  logSecurityEvent, 
  createSecurityHeaders 
} from "./production-utils.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  ...createSecurityHeaders()
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

// Production-ready HTML email template
const createConfirmationEmailHTML = (confirmationUrl: string, userEmail: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PrepGenie - Confirm Your Account</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #4b5563;
      background-color: #ffffff;
    }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { 
      text-align: center; 
      padding: 32px 0; 
      border-bottom: 1px solid #e3f9ed; 
      margin-bottom: 32px; 
    }
    .brand-name { 
      font-size: 32px; 
      font-weight: bold; 
      color: #3dc087; 
      margin: 0 0 8px 0; 
    }
    .tagline { 
      font-size: 16px; 
      color: #6b7280; 
      margin: 0; 
    }
    .content { padding: 0 20px; }
    .title { 
      color: #1f2937; 
      font-size: 28px; 
      font-weight: bold; 
      margin: 0 0 24px 0; 
      text-align: center; 
      line-height: 1.3; 
    }
    .text { 
      color: #4b5563; 
      font-size: 16px; 
      line-height: 1.6; 
      margin: 0 0 16px 0; 
    }
    .button-container { 
      text-align: center; 
      margin: 32px 0; 
    }
    .button { 
      background-color: #3dc087; 
      border-radius: 8px; 
      color: #ffffff; 
      font-size: 16px; 
      font-weight: 600; 
      text-decoration: none; 
      display: inline-block; 
      padding: 14px 32px; 
      border: none; 
    }
    .small-text { 
      color: #6b7280; 
      font-size: 14px; 
      line-height: 1.5; 
      margin: 0 0 12px 0; 
    }
    .features-section { 
      margin: 40px 0; 
      padding: 24px; 
      background-color: #f2fcf6; 
      border-radius: 8px; 
      border: 1px solid #c7f2dc; 
    }
    .features-title { 
      color: #374151; 
      font-size: 20px; 
      font-weight: 600; 
      margin: 0 0 16px 0; 
      line-height: 1.4; 
    }
    .feature-item { 
      color: #374151; 
      font-size: 15px; 
      line-height: 1.6; 
      margin: 0 0 8px 0; 
    }
    .backup-section { 
      margin: 32px 0; 
      padding: 20px; 
      background-color: #f9fafb; 
      border-radius: 6px; 
      border: 1px solid #e5e7eb; 
    }
    .link-text { 
      color: #3dc087; 
      font-size: 13px; 
      word-break: break-all; 
      margin: 8px 0 0 0; 
    }
    .footer { 
      padding: 32px 20px 0 20px; 
      border-top: 1px solid #e5e7eb; 
      text-align: center; 
      margin-top: 48px; 
    }
    .footer-text { 
      color: #6b7280; 
      font-size: 14px; 
      line-height: 1.5; 
      margin: 0 0 12px 0; 
    }
    .footer-brand { 
      color: #3dc087; 
      font-size: 15px; 
      font-weight: 600; 
      margin: 20px 0 0 0; 
    }
    @media (max-width: 600px) {
      .container { padding: 10px; }
      .content { padding: 0 10px; }
      .title { font-size: 24px; }
      .brand-name { font-size: 28px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-name">PrepGenie</div>
      <div class="tagline">Your AI-Powered Study Companion</div>
    </div>

    <div class="content">
      <h1 class="title">Welcome to PrepGenie! 🎉</h1>
      
      <p class="text">
        Hi there! We're excited to have you join our community of smart learners.
      </p>

      <p class="text">
        To get started with your PrepGenie account (<strong>${userEmail}</strong>), 
        please confirm your email address by clicking the button below:
      </p>

      <div class="button-container">
        <a href="${confirmationUrl}" class="button">
          Confirm Your Account
        </a>
      </div>

      <p class="small-text">
        This link will expire in 24 hours for security reasons.
      </p>

      <div class="features-section">
        <h2 class="features-title">What's Next?</h2>
        <p class="text">After confirming your email, you'll be able to:</p>
        
        <div>
          <p class="feature-item">📝 Create and organize your study notes</p>
          <p class="feature-item">🧠 Generate AI-powered flashcards</p>
          <p class="feature-item">📊 Track your learning progress</p>
          <p class="feature-item">🎯 Set and achieve study goals</p>
        </div>
      </div>

      <div class="backup-section">
        <p class="small-text">
          Having trouble with the button? Copy and paste this link into your browser:
        </p>
        <p class="link-text">${confirmationUrl}</p>
      </div>
    </div>

    <div class="footer">
      <p class="footer-text">
        If you didn't create an account with PrepGenie, you can safely ignore this email.
      </p>
      <p class="footer-text">
        Questions? We're here to help! Just reply to this email.
      </p>
      <p class="footer-brand">
        Best regards,<br>
        The PrepGenie Team
      </p>
    </div>
  </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  const startTime = Date.now();
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    logSecurityEvent("INVALID_METHOD", { method: req.method, clientIP });
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { user, email_data }: AuthEmailRequest = await req.json();
    
    // Input validation
    if (!user?.email || !email_data?.token_hash) {
      logSecurityEvent("MISSING_FIELDS", { clientIP, hasEmail: !!user?.email, hasToken: !!email_data?.token_hash });
      return new Response("Missing required fields", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(user.email);
    if (!validateEmailFormat(sanitizedEmail)) {
      logSecurityEvent("INVALID_EMAIL_FORMAT", { clientIP, email: sanitizedEmail });
      return new Response("Invalid email format", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Rate limiting per email address
    if (!checkRateLimit(sanitizedEmail, 3, 300000)) { // 3 requests per 5 minutes per email
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { clientIP, email: sanitizedEmail });
      return new Response("Rate limit exceeded", { 
        status: 429, 
        headers: corsHeaders 
      });
    }

    console.log("🔐 [AUTH EMAIL] Processing auth email for:", sanitizedEmail);
    console.log("🔐 [AUTH EMAIL] Email action type:", email_data.email_action_type);

    // Only handle signup confirmations
    if (email_data.email_action_type !== "signup") {
      console.log("🔐 [AUTH EMAIL] Skipping non-signup action:", email_data.email_action_type);
      return new Response("Not a signup confirmation", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Generate the confirmation URL with additional validation
    if (!email_data.site_url || !email_data.redirect_to) {
      logSecurityEvent("MISSING_URL_DATA", { clientIP, email: sanitizedEmail });
      return new Response("Missing URL configuration", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

    // Generate fast HTML email using template literal
    const html = createConfirmationEmailHTML(confirmationUrl, sanitizedEmail);

    // Send the email with production settings
    const emailResponse = await resend.emails.send({
      from: "PrepGenie <noreply@resend.dev>", // Update to custom domain when ready
      to: [sanitizedEmail],
      subject: "Welcome to PrepGenie - Confirm Your Account",
      html,
      headers: {
        'X-Entity-Ref-ID': user.id, // For tracking
        'X-Client-IP': clientIP, // For audit trail
      }
    });

    const processingTime = Date.now() - startTime;
    console.log(`🔐 [AUTH EMAIL] Email sent successfully in ${processingTime}ms:`, {
      messageId: emailResponse.data?.id,
      to: sanitizedEmail,
      processingTime,
      clientIP
    });

    return new Response(JSON.stringify({ 
      success: true,
      messageId: emailResponse.data?.id,
      processingTime 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    logSecurityEvent("EMAIL_SEND_ERROR", { 
      clientIP, 
      error: error.message, 
      processingTime 
    });
    
    console.error("🔐 [AUTH EMAIL] Error sending auth email:", {
      error: error.message,
      stack: error.stack,
      processingTime,
      clientIP
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send confirmation email",
        processingTime 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);