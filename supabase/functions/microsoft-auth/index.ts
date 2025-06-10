
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
      throw new Error("Microsoft OAuth credentials not configured");
    }

    const { code, redirect_uri, grant_type, refresh_token } = await req.json();
    
    let requestBody: URLSearchParams;
    
    if (grant_type === "authorization_code") {
      // Exchange authorization code for tokens
      requestBody = new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
        scope: "Notes.Read Notes.ReadWrite User.Read"
      });
    } else if (grant_type === "refresh_token") {
      // Refresh access token
      requestBody = new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: "refresh_token",
        scope: "Notes.Read Notes.ReadWrite User.Read"
      });
    } else {
      throw new Error("Invalid grant type");
    }

    console.log("Making request to Microsoft token endpoint...");
    
    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Microsoft token exchange error:", data);
      throw new Error(data.error_description || data.error || "Token exchange failed");
    }

    console.log("Microsoft token exchange successful");

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
        scope: data.scope
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in microsoft-auth function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
