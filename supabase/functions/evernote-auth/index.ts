
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
    
    // Evernote OAuth configuration
    const clientId = Deno.env.get("EVERNOTE_CLIENT_ID");
    const clientSecret = Deno.env.get("EVERNOTE_CLIENT_SECRET");
    const redirectUri = Deno.env.get("EVERNOTE_REDIRECT_URI");
    const sandbox = Deno.env.get("EVERNOTE_SANDBOX") === "true";
    
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Evernote OAuth credentials are not configured");
    }
    
    // Determine the OAuth endpoint based on sandbox mode
    const evernoteHost = sandbox ? "sandbox.evernote.com" : "www.evernote.com";
    const tokenUrl = `https://${evernoteHost}/oauth`;
    
    // Exchange the code for an access token
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
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
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in evernote-auth function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
