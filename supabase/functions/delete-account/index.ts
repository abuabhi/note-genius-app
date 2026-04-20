import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Verify caller identity using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    console.log("[delete-account] Deleting user:", userId);

    // 2) Use service role to wipe user data + delete the auth user
    const admin = createClient(supabaseUrl, serviceKey);

    // Best-effort cascade: delete user-owned rows in primary tables.
    // RLS + FK CASCADEs in the schema will handle most dependents, but we
    // explicitly remove these to avoid orphan rows if cascades aren't set.
    const tables = [
      "feedback",
      "todos",
      "goals",
      "events",
      "reminders",
      "note_tags",
      "note_chat_messages",
      "note_content_expansions",
      "note_enrichment_usage",
      "notes",
      "flashcards",
      "flashcard_sets",
      "learning_progress",
      "learning_insights",
      "learning_patterns",
      "learning_velocity_metrics",
      "user_subjects",
      "user_roles",
      "profiles",
      "email_digest_preferences",
    ];

    for (const t of tables) {
      const { error } = await admin.from(t).delete().eq("user_id", userId);
      if (error) console.warn(`[delete-account] ${t}:`, error.message);
    }

    // 3) Delete the auth user (this is the source of truth)
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.error("[delete-account] auth.admin.deleteUser:", deleteErr);
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[delete-account] error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
