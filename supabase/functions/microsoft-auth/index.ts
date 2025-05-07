
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Microsoft OAuth configuration from environment variables
const CLIENT_ID = Deno.env.get('MS_CLIENT_ID') || '';
const CLIENT_SECRET = Deno.env.get('MS_CLIENT_SECRET') || '';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    const { code, redirect_uri, refresh_token, grant_type } = await req.json();
    
    // Validate required parameters
    if (grant_type !== 'authorization_code' && grant_type !== 'refresh_token') {
      return new Response(
        JSON.stringify({ error: 'Invalid grant_type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate required parameters
    if (grant_type === 'authorization_code' && (!code || !redirect_uri)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (grant_type === 'refresh_token' && !refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Missing refresh token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Build form data for token request
    const formData = new URLSearchParams();
    formData.append('client_id', CLIENT_ID);
    formData.append('client_secret', CLIENT_SECRET);
    formData.append('grant_type', grant_type);
    
    if (grant_type === 'authorization_code') {
      formData.append('code', code);
      formData.append('redirect_uri', redirect_uri);
    } else {
      formData.append('refresh_token', refresh_token);
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Microsoft token error:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code for tokens' }),
        { 
          status: tokenResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Return tokens to client
    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Microsoft auth error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
