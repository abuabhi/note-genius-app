
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { name, email, subject, message }: ContactFormData = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store the contact submission in the database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject: subject || 'Contact Form Submission',
        message,
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "PrepGenie Contact <noreply@prepgenie.io>",
      to: ["hello@prepgenie.io"],
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Submission ID: ${submission.id}
        </p>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "PrepGenie Support <hello@prepgenie.io>",
      to: [email],
      subject: "We received your message - PrepGenie Support",
      html: `
        <h2>Thank you for contacting PrepGenie!</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you as soon as possible, typically within 24 hours during business days.</p>
        
        <div style="background-color: #f8f9ff; padding: 15px; border-radius: 5px; border-left: 4px solid #4f46e5; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4f46e5;">Your Message:</h3>
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 10px; border-radius: 3px; margin-top: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <p>If you have any urgent questions, you can also:</p>
        <ul>
          <li>Check our <a href="https://prepgenie.io/help" style="color: #4f46e5;">Help Center</a></li>
          <li>Browse our <a href="https://prepgenie.io/faq" style="color: #4f46e5;">FAQ</a></li>
        </ul>

        <p>Best regards,<br>The PrepGenie Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
        <p style="font-size: 12px; color: #666;">
          This is an automated confirmation email. Please do not reply directly to this email.
        </p>
      `,
    });

    console.log('Admin email sent:', adminEmailResponse);
    console.log('User confirmation sent:', userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Your message has been sent successfully!',
        submissionId: submission.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-contact-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send message. Please try again later or email us directly at hello@prepgenie.io' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
