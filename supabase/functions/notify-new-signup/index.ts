import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const PUSHOVER_APP_TOKEN = Deno.env.get("PUSHOVER_APP_TOKEN");
    const PUSHOVER_USER_KEY = Deno.env.get("PUSHOVER_USER_KEY");
    if (!PUSHOVER_APP_TOKEN || !PUSHOVER_USER_KEY) {
      throw new Error("Pushover secrets not configured");
    }

    const payload = await req.json().catch(() => ({}));
    const email = payload?.email ?? payload?.record?.email ?? "unknown";
    const userId = payload?.user_id ?? payload?.record?.id ?? "";
    const fullName =
      payload?.full_name ?? payload?.record?.raw_user_meta_data?.full_name ?? "";

    const message = [
      `Email: ${email}`,
      fullName ? `Name: ${fullName}` : null,
      userId ? `ID: ${userId}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const form = new URLSearchParams({
      token: PUSHOVER_APP_TOKEN,
      user: PUSHOVER_USER_KEY,
      title: "🎉 New PrepGenie signup",
      message,
      priority: "0",
    });

    const res = await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await res.json();
    if (!res.ok || data?.status !== 1) {
      throw new Error(`Pushover failed [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("notify-new-signup error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
