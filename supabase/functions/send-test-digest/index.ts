
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const resend = new Resend(resendApiKey)

    // Get user from authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's digest preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('email_digest_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefsError || !preferences) {
      return new Response(
        JSON.stringify({ error: 'Email digest preferences not found. Please configure your email preferences first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send test email
    const testTime = new Date().toLocaleString()
    const { error: emailError } = await resend.emails.send({
      from: 'StudyMate <noreply@studymate.app>',
      to: [user.email || ''],
      subject: `📧 Test Email Digest - ${testTime}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669; margin-bottom: 20px;">📧 Test Email Digest</h1>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #0369a1;">
              <strong>✅ Success!</strong> Your email digest is working properly.
            </p>
            <p style="margin: 8px 0 0 0; color: #0369a1; font-size: 14px;">
              Test sent at: ${testTime}
            </p>
          </div>

          <h2 style="color: #374151; font-size: 18px; margin: 20px 0 10px 0;">Your Current Settings:</h2>
          <ul style="color: #6b7280; line-height: 1.6;">
            <li><strong>Frequency:</strong> ${preferences.frequency}</li>
            <li><strong>Time:</strong> ${preferences.digest_time}</li>
            <li><strong>Timezone:</strong> ${preferences.timezone}</li>
            <li><strong>Include Goals:</strong> ${preferences.include_goals ? 'Yes' : 'No'}</li>
            <li><strong>Include Todos:</strong> ${preferences.include_todos ? 'Yes' : 'No'}</li>
            <li><strong>Include Notes:</strong> ${preferences.include_notes ? 'Yes' : 'No'}</li>
            <li><strong>Include Flashcards:</strong> ${preferences.include_flashcards ? 'Yes' : 'No'}</li>
          </ul>

          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #374151; font-size: 14px;">
              This is a test email. Your actual daily digest will contain your real study data and will be sent according to your scheduled time.
            </p>
          </div>
        </div>
      `,
    })

    if (emailError) {
      throw emailError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test email sent successfully!',
        sentTo: user.email,
        sentAt: testTime
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending test email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send test email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
