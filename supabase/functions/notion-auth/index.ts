
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the authorization code from the request
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      throw new Error("Authorization code is required");
    }
    
    // Notion OAuth configuration
    const clientId = Deno.env.get("NOTION_CLIENT_ID");
    const clientSecret = Deno.env.get("NOTION_CLIENT_SECRET");
    const redirectUri = Deno.env.get("NOTION_REDIRECT_URI");
    
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Notion OAuth credentials are not configured");
    }
    
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      throw new Error(`Failed to exchange code for token: ${errorData}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        access_token: tokenData.access_token,
        workspace_name: tokenData.workspace_name,
        workspace_icon: tokenData.workspace_icon,
        bot_id: tokenData.bot_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notion-auth function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
