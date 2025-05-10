
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Get Google OAuth credentials from environment variables
const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
const tokenUrl = 'https://oauth2.googleapis.com/token';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { code, redirect_uri, grant_type, refresh_token } = await req.json();
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Google client credentials are not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Handle authorization code flow
    if (grant_type === 'authorization_code' && code) {
      // Exchange the code for an access token
      const formData = new URLSearchParams();
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);
      formData.append('code', code);
      formData.append('redirect_uri', redirect_uri);
      formData.append('grant_type', 'authorization_code');
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Failed to exchange authorization code:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange authorization code' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      const tokenData = await tokenResponse.json();
      
      return new Response(
        JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in || 3600 // Default to 1 hour if not provided
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } else if (grant_type === 'refresh_token' && refresh_token) {
      // Handle refresh token flow
      const formData = new URLSearchParams();
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);
      formData.append('refresh_token', refresh_token);
      formData.append('grant_type', 'refresh_token');
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Failed to refresh token:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to refresh token' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      const tokenData = await tokenResponse.json();
      
      return new Response(
        JSON.stringify({
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in || 3600
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request parameters' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Error in Google OAuth handler:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
