
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferralEmailRequest {
  referralCode: string;
  referralLink: string;
  recipientEmail: string;
  senderName?: string;
  personalMessage?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REFERRAL-EMAIL] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { 
      referralCode, 
      referralLink, 
      recipientEmail, 
      senderName = "A friend",
      personalMessage = ""
    }: ReferralEmailRequest = await req.json();

    logStep("Request data received", { recipientEmail, referralCode });

    if (!recipientEmail || !referralCode || !referralLink) {
      throw new Error("Missing required fields: recipientEmail, referralCode, or referralLink");
    }

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #6b7280;
              font-size: 16px;
            }
            .personal-message {
              background: #ecfdf5;
              border-left: 4px solid #10b981;
              padding: 16px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            .features {
              margin: 30px 0;
            }
            .feature {
              display: flex;
              align-items: center;
              margin: 12px 0;
              padding: 8px 0;
            }
            .feature-icon {
              color: #10b981;
              margin-right: 12px;
              font-weight: bold;
            }
            .cta-button {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 18px;
              text-align: center;
              margin: 20px 0;
            }
            .cta-section {
              text-align: center;
              margin: 30px 0;
            }
            .referral-code {
              background: #f3f4f6;
              border: 2px dashed #d1d5db;
              padding: 16px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
              font-family: monospace;
              font-size: 18px;
              font-weight: bold;
              color: #374151;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .footer a {
              color: #10b981;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚 PrepGenie</div>
              <h1 class="title">You're Invited to Join PrepGenie!</h1>
              <p class="subtitle">${senderName} thought you'd love our smart study platform</p>
            </div>

            ${personalMessage ? `
              <div class="personal-message">
                <strong>Personal message from ${senderName}:</strong><br>
                ${personalMessage}
              </div>
            ` : ''}

            <p>Hi there!</p>
            <p>${senderName} has invited you to join <strong>PrepGenie</strong> - the smart study platform that's transforming how students learn and succeed!</p>

            <div class="features">
              <h3>🚀 What makes PrepGenie special:</h3>
              <div class="feature">
                <span class="feature-icon">🧠</span>
                <span><strong>Smart AI Flashcards:</strong> Cards that adapt to your learning style</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📝</span>
                <span><strong>Intelligent Notes:</strong> AI-powered organization and insights</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📊</span>
                <span><strong>Progress Tracking:</strong> See your improvement in real-time</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🎯</span>
                <span><strong>Personalized Study Plans:</strong> Tailored to your goals</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🤝</span>
                <span><strong>Study Groups:</strong> Collaborate with friends and classmates</span>
              </div>
            </div>

            <div class="cta-section">
              <p><strong>🎁 Special Bonus: Join using this link and you'll both get rewards!</strong></p>
              
              <a href="${referralLink}" class="cta-button">
                🚀 Start Your Learning Journey
              </a>
              
              <p>Or use referral code:</p>
              <div class="referral-code">${referralCode}</div>
            </div>

            <p>Thousands of students are already using PrepGenie to boost their grades and study more efficiently. Join them today and experience the future of learning!</p>

            <div class="footer">
              <p>This invitation was sent by ${senderName}. If you don't want to receive these emails, you can safely ignore this message.</p>
              <p><a href="${referralLink}">Join PrepGenie</a> • <a href="https://prepgenie.io">Visit our website</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    logStep("Sending email via Resend");
    const emailResponse = await resend.emails.send({
      from: "PrepGenie <no-reply@prepgenie.io>",
      to: [recipientEmail],
      subject: `${senderName} invited you to join PrepGenie - Smart Study Platform! 📚`,
      html: emailHtml,
    });

    logStep("Email sent successfully", { 
      emailId: emailResponse.data?.id,
      recipient: recipientEmail 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Referral email sent successfully!"
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR in send-referral-email", { 
      message: error.message,
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        ...corsHeaders 
      },
    });
  }
};

serve(handler);
