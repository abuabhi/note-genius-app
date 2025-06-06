
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReferralEmailRequest {
  referralCode: string;
  referralLink: string;
  recipientEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referralCode, referralLink }: ReferralEmailRequest = await req.json();

    // For now, we'll return a simple HTML form that allows users to send the email
    // In the future, this could integrate with an email service like Resend
    const emailForm = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Share StudyBuddy with Friends</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              background: #f8fafc;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #1f2937;
              margin-bottom: 20px;
            }
            .form-group {
              margin-bottom: 20px;
            }
            label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              color: #374151;
            }
            input, textarea {
              width: 100%;
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              font-size: 16px;
            }
            textarea {
              height: 120px;
              resize: vertical;
            }
            .btn {
              background: #10b981;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
            }
            .btn:hover {
              background: #059669;
            }
            .referral-info {
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .link-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📧 Share StudyBuddy with Friends</h1>
            
            <div class="referral-info">
              <h3>Your Referral Details:</h3>
              <p><strong>Referral Code:</strong> ${referralCode}</p>
              <p><strong>Referral Link:</strong></p>
              <div class="link-box">${referralLink}</div>
            </div>

            <form id="emailForm">
              <div class="form-group">
                <label for="recipients">Email Recipients (separate multiple emails with commas):</label>
                <input type="email" id="recipients" name="recipients" 
                       placeholder="friend1@example.com, friend2@example.com" required>
              </div>
              
              <div class="form-group">
                <label for="subject">Subject:</label>
                <input type="text" id="subject" name="subject" 
                       value="Try StudyBuddy - Great Study Platform!" required>
              </div>
              
              <div class="form-group">
                <label for="message">Personal Message:</label>
                <textarea id="message" name="message" 
                          placeholder="Add a personal note to your friends...">Hi there!

I've been using StudyBuddy for my studies and thought you might find it helpful too. It's a comprehensive platform with smart flashcards, note organization, and progress tracking.

Here's my referral link to get started:
${referralLink}

Best regards!</textarea>
              </div>
              
              <button type="submit" class="btn">Send Email Invitations</button>
            </form>
          </div>

          <script>
            document.getElementById('emailForm').addEventListener('submit', function(e) {
              e.preventDefault();
              
              const recipients = document.getElementById('recipients').value;
              const subject = document.getElementById('subject').value;
              const message = document.getElementById('message').value;
              
              // Create mailto link with multiple recipients
              const mailtoLink = 'mailto:' + recipients + 
                               '?subject=' + encodeURIComponent(subject) + 
                               '&body=' + encodeURIComponent(message);
              
              window.location.href = mailtoLink;
              
              // Show success message
              alert('Email client opened! Your referral emails are ready to send.');
              
              // Close window after a delay
              setTimeout(() => {
                window.close();
              }, 2000);
            });
          </script>
        </body>
      </html>
    `;

    return new Response(emailForm, {
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-referral-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
