
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface WhatsAppPayload {
  to: string;
  body: string;
}

interface NotificationPayload {
  userId: string;
  type: 'email' | 'whatsapp';
  subject?: string;
  body: string;
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request data
    const { userId, type, subject, body }: NotificationPayload = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch user profile to get email and preferences
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, notification_preferences, whatsapp_phone, do_not_disturb, dnd_start_time, dnd_end_time')
      .eq('id', userId)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user email from auth.users
    const { data: userData, error: userError } = await supabase
      .auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const email = userData.user.email

    // Check if DND is active
    let isDndActive = false
    if (profileData.do_not_disturb) {
      if (!profileData.dnd_start_time || !profileData.dnd_end_time) {
        isDndActive = true // If no time range is set, DND is always active
      } else {
        // Check if current time is within DND hours
        const now = new Date()
        const userTimezoneOffset = now.getTimezoneOffset() * 60000 // Convert to milliseconds
        const userTime = new Date(now.getTime() - userTimezoneOffset)
        const currentHour = userTime.getHours()
        const currentMinute = userTime.getMinutes()
        
        const [startHour, startMinute] = profileData.dnd_start_time.split(':').map(Number)
        const [endHour, endMinute] = profileData.dnd_end_time.split(':').map(Number)
        
        const currentMinutes = currentHour * 60 + currentMinute
        const startMinutes = startHour * 60 + startMinute
        const endMinutes = endHour * 60 + endMinute
        
        if (startMinutes <= endMinutes) {
          // Simple case: start time is before end time (same day)
          isDndActive = currentMinutes >= startMinutes && currentMinutes <= endMinutes
        } else {
          // Complex case: end time is on the next day (e.g., 10:00 PM - 6:00 AM)
          isDndActive = currentMinutes >= startMinutes || currentMinutes <= endMinutes
        }
      }
    }

    if (isDndActive) {
      return new Response(
        JSON.stringify({ success: false, message: 'Notification not sent - Do Not Disturb is active' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify notification preferences
    const preferences = profileData.notification_preferences || {}
    
    if (type === 'email') {
      if (!preferences.email) {
        return new Response(
          JSON.stringify({ success: false, message: 'User has disabled email notifications' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Send email via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      if (!resendApiKey) {
        throw new Error('Missing Resend API Key')
      }

      const emailPayload: EmailPayload = {
        to: email,
        subject: subject || 'Study Notification',
        html: body,
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Study App <notifications@studyapp.com>',
          ...emailPayload,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to send email: ${JSON.stringify(responseData)}`)
      }

      return new Response(
        JSON.stringify({ success: true, data: responseData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else if (type === 'whatsapp') {
      if (!preferences.whatsapp) {
        return new Response(
          JSON.stringify({ success: false, message: 'User has disabled WhatsApp notifications' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const whatsappPhone = profileData.whatsapp_phone
      if (!whatsappPhone) {
        return new Response(
          JSON.stringify({ success: false, message: 'User has not provided a WhatsApp phone number' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // For demonstration purposes - in a real app, you would integrate with Twilio or another WhatsApp API
      console.log(`Would send WhatsApp to ${whatsappPhone}: ${body}`)
      
      // Mock successful response
      return new Response(
        JSON.stringify({ success: true, message: 'WhatsApp notification would be sent (mock)' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    else {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } 
  catch (error) {
    console.error('Error processing notification request:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
