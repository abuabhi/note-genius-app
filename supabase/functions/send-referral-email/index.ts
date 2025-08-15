
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralEmailRequest {
  to: string;
  referrerName: string;
  referralCode: string;
  type: 'invitation' | 'welcome' | 'achievement';
  message?: string;
  referralLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, referrerName, referralCode, type, message, referralLink }: ReferralEmailRequest = await req.json();

    const link = referralLink || `https://www.prepgenie.io/signup?ref=${encodeURIComponent(referralCode)}`;

    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'invitation':
        subject = `${referrerName} invited you to join PrepGenie! 🎓`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin: 0 0 10px 0; font-size: 28px;">You're Invited! 🎉</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">${referrerName} thinks you'd love PrepGenie</p>
              </div>
              
              ${message ? `
              <div style="background-color: #eef2ff; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                <p style="margin: 0; color: #1f2937; line-height: 1.6;"><em>Personal message:</em><br/>${message.replace(/\n/g, '<br/>')}</p>
              </div>
              ` : ''}
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Hi there!</p>
                <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">${referrerName} has invited you to join PrepGenie, the AI-powered study platform that's helping thousands of students learn more effectively.</p>
                <p style="margin: 0; color: #374151; line-height: 1.6;">Sign up with the code below and start your learning journey today!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0 0 5px 0; color: #92400e; font-size: 14px; font-weight: bold;">Your Referral Code:</p>
                  <p style="margin: 0; color: #92400e; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${referralCode}</p>
                </div>
                <a href="${link}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join PrepGenie Now</a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Ready to transform your studying?<br/><strong>The PrepGenie Team</strong></p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'welcome':
        subject = 'Welcome to PrepGenie! Your learning journey begins now 🎓';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin: 0 0 10px 0; font-size: 28px;">Welcome to PrepGenie! 🎉</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">Thanks for joining via ${referrerName}'s referral</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">You've successfully joined PrepGenie! Get ready to revolutionize your studying with AI-powered flashcards, notes, and quizzes.</p>
                <p style="margin: 0; color: #374151; line-height: 1.6;">Both you and ${referrerName} will earn bonus points for this successful referral!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.prepgenie.io/dashboard" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Learning Now</a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Happy studying!<br><strong>The PrepGenie Team</strong></p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'achievement':
        subject = 'Referral Success! You earned points 🏆';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; margin: 0 0 10px 0; font-size: 28px;">Referral Success! 🏆</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 0;">You've earned referral points</p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; color: #92400e; line-height: 1.6;">Congratulations! Someone just signed up using your referral code <strong>${referralCode}</strong>.</p>
                <p style="margin: 0; color: #92400e; line-height: 1.6;">You've earned <strong>100 referral points</strong> that can be used for contests and special features!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.prepgenie.io/referrals" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Referrals</a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Keep sharing PrepGenie!<br><strong>The PrepGenie Team</strong></p>
              </div>
            </div>
          </div>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "PrepGenie <hello@prepgenie.io>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    console.log("Referral email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Referral email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-referral-email function:", error);
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
