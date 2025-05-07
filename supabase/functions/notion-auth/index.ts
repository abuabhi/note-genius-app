
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Notion credentials from environment variables
const clientId = Deno.env.get('NOTION_CLIENT_ID');
const clientSecret = Deno.env.get('NOTION_CLIENT_SECRET');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { code, redirect_uri, grant_type, refresh_token } = await req.json();
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Notion client credentials are not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Handle authorization code flow
    if (grant_type === 'authorization_code' && code) {
      // Exchange the code for an access token
      const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri
        })
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
          workspace_id: tokenData.workspace_id,
          workspace_name: tokenData.workspace_name,
          bot_id: tokenData.bot_id,
          expires_in: tokenData.expires_in || 3600 // Default to 1 hour if not provided
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request parameters' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Error in Notion OAuth handler:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
