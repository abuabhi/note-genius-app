
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
    console.log("Microsoft auth function called");
    console.log("Client ID exists:", !!MICROSOFT_CLIENT_ID);
    console.log("Client Secret exists:", !!MICROSOFT_CLIENT_SECRET);
    console.log("Client ID value:", MICROSOFT_CLIENT_ID);
    console.log("Client Secret first 10 chars:", MICROSOFT_CLIENT_SECRET?.substring(0, 10));
    console.log("Client Secret last 5 chars:", MICROSOFT_CLIENT_SECRET?.substring(-5));
    
    if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
      console.error("Missing credentials - Client ID:", !!MICROSOFT_CLIENT_ID, "Client Secret:", !!MICROSOFT_CLIENT_SECRET);
      throw new Error("Microsoft OAuth credentials not configured properly");
    }

    const body = await req.json();
    console.log("Request body action:", body.action);
    
    // Handle client ID request
    if (body.action === 'get_client_id') {
      return new Response(
        JSON.stringify({ client_id: MICROSOFT_CLIENT_ID }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const { code, redirect_uri, grant_type, refresh_token } = body;
    
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
      console.log("Exchanging authorization code for tokens");
      console.log("Request body params (without secret):", {
        client_id: MICROSOFT_CLIENT_ID,
        code: code?.substring(0, 20) + "...",
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
      console.log("Refreshing access token");
    } else {
      throw new Error("Invalid grant type");
    }

    console.log("Making request to Microsoft token endpoint...");
    console.log("Using client ID:", MICROSOFT_CLIENT_ID);
    console.log("Secret length:", MICROSOFT_CLIENT_SECRET?.length || 0);
    
    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Microsoft token exchange error:", JSON.stringify(data, null, 2));
      console.error("Response status:", response.status);
      console.error("Response statusText:", response.statusText);
      
      // More specific error message
      let errorMessage = data.error_description || data.error || "Token exchange failed";
      if (data.error === "invalid_client") {
        errorMessage = "Invalid Microsoft app credentials. The Client Secret appears to be incorrect. Please verify you copied the secret VALUE (not the ID) from Azure portal.";
      }
      
      throw new Error(errorMessage);
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
        details: error.toString(),
        timestamp: new Date().toISOString()
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
