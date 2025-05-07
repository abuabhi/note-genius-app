
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration for your Evernote OAuth
interface Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox: boolean; // Use sandbox for development
}

// Get environment variables
const getConfig = async (req: Request): Promise<Config> => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  );

  // Get Evernote configuration from secrets
  const clientId = Deno.env.get("EVERNOTE_CLIENT_ID") || "";
  const clientSecret = Deno.env.get("EVERNOTE_CLIENT_SECRET") || "";
  const redirectUri = Deno.env.get("EVERNOTE_REDIRECT_URI") || "";
  const sandbox = Deno.env.get("EVERNOTE_SANDBOX") === "true";

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Evernote configuration");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    sandbox,
  };
};

// Handle OAuth authorization request
async function handleAuthorize(config: Config, state: string) {
  // Evernote OAuth endpoint
  const baseUrl = config.sandbox 
    ? "https://sandbox.evernote.com" 
    : "https://www.evernote.com";

  const authUrl = new URL(`${baseUrl}/oauth`);
  authUrl.searchParams.append("oauth_consumer_key", config.clientId);
  authUrl.searchParams.append("oauth_callback", config.redirectUri);
  authUrl.searchParams.append("oauth_signature_method", "PLAINTEXT");
  authUrl.searchParams.append("oauth_signature", config.clientSecret + "&");
  authUrl.searchParams.append("oauth_timestamp", Math.floor(Date.now() / 1000).toString());
  authUrl.searchParams.append("oauth_nonce", Math.random().toString(36).substring(2, 15));
  authUrl.searchParams.append("state", state);

  return { authUrl: authUrl.toString() };
}

// Handle token exchange
async function handleToken(config: Config, code: string) {
  // Evernote OAuth token endpoint
  const baseUrl = config.sandbox 
    ? "https://sandbox.evernote.com" 
    : "https://www.evernote.com";

  try {
    // For Evernote, the token exchange usually happens via a second OAuth step
    // Note: This is a simplified version. Evernote OAuth is complex and may require more steps
    const response = await fetch(`${baseUrl}/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        oauth_consumer_key: config.clientId,
        oauth_signature: config.clientSecret + "&" + code,
        oauth_signature_method: "PLAINTEXT",
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: Math.random().toString(36).substring(2, 15),
        oauth_token: code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange token: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();

    // Parse the response which is usually in x-www-form-urlencoded format
    const params = new URLSearchParams(responseText);
    const access_token = params.get("oauth_token");
    const username = "Evernote User"; // Evernote doesn't provide username in this flow, this is a placeholder

    return {
      access_token,
      username,
      token_type: "Bearer",
      expires_in: null, // Evernote tokens don't expire
    };
  } catch (error) {
    console.error("Token exchange error:", error);
    throw error;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { action, code, state } = await req.json();
    
    // Get configuration
    const config = await getConfig(req);

    // Handle different actions
    if (action === "authorize") {
      const result = await handleAuthorize(config, state);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "token") {
      const result = await handleToken(config, code);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error("Evernote auth error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
