
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

type Tier = "SCHOLAR" | "GRADUATE" | "MASTER" | "DEAN";

const TIER_LIMITS: Record<Tier, number | "unlimited"> = {
  SCHOLAR: 20,
  GRADUATE: 100,
  MASTER: 500,
  DEAN: "unlimited",
};

function getMonthYear(date = new Date()) {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return { user: null, error: "Missing or invalid Authorization header" };

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabaseUser.auth.getUser();
  if (error || !data?.user) return { user: null, error: error?.message ?? "Unauthorized" };
  return { user: data.user, error: null };
}

async function getUserTier(admin: ReturnType<typeof createClient>, userId: string): Promise<Tier> {
  const { data, error } = await admin
    .from("profiles")
    .select("user_tier")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.log("Failed to load user tier, defaulting to SCHOLAR:", error.message);
    return "SCHOLAR";
  }
  const tier = (data?.user_tier as Tier) ?? "SCHOLAR";
  return tier;
}

async function getMonthlyUsageCount(admin: ReturnType<typeof createClient>, userId: string, monthYear: string) {
  const { error, count } = await admin
    .from("note_enrichment_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("month_year", monthYear);

  if (error) {
    console.log("Usage count error:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function recordUsage(admin: ReturnType<typeof createClient>, userId: string, noteId: string | null, monthYear: string) {
  const { error } = await admin
    .from("note_enrichment_usage")
    .insert({
      user_id: userId,
      note_id: noteId,
      month_year: monthYear,
      // created_at defaults to now()
    } as any);

  if (error) {
    console.log("Failed to record usage (non-fatal):", error.message);
  }
}

async function generateEnhancedContent(noteContent: string, enhancementType: string, noteTitle?: string) {
  if (!OPENAI_API_KEY) {
    // Fallback simple transformation if no API key is configured
    const header = `[ENRICHED] ${noteTitle ?? "Note"} - ${enhancementType}`;
    return `${header}\n\n${noteContent}\n\nKey Improvements:\n- Clarified structure\n- Highlighted key points\n- Suggested study takeaways`;
  }

  const system = `You are an assistant that enhances student notes.
Enhancement type: ${enhancementType}.
Improve clarity, add key points and study takeaways without changing meaning.
Return enriched content only.`;

  const user = `Title: ${noteTitle ?? "Untitled"}
Content:
${noteContent}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }

  const data = await response.json();
  const enhanced = data?.choices?.[0]?.message?.content ?? "";
  return enhanced || `${noteContent}\n\n[Enhanced content unavailable]`;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "unauthorized", message: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const noteId: string | null = body.noteId ?? null;
    const noteContent: string = body.noteContent ?? "";
    const enhancementType: string = body.enhancementType ?? "enrich-note";
    const noteTitle: string | undefined = body.noteTitle;

    if (!noteContent || typeof noteContent !== "string") {
      return new Response(JSON.stringify({ success: false, error: "invalid_payload", message: "noteContent is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine limits
    const tier = await getUserTier(admin, user.id);
    const limit = TIER_LIMITS[tier] === "unlimited" ? Number.POSITIVE_INFINITY : (TIER_LIMITS[tier] as number);

    const monthYear = getMonthYear();
    const used = await getMonthlyUsageCount(admin, user.id, monthYear);

    if (used >= limit) {
      const payload = {
        success: false,
        error: "usage_limit_reached",
        message: `You've reached your monthly AI enrichment limit (${used}/${limit}).`,
        usage: { used, limit, remaining: 0, monthYear },
      };
      return new Response(JSON.stringify(payload), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate enriched content
    const enhancedContent = await generateEnhancedContent(noteContent, enhancementType, noteTitle);

    // Record usage
    await recordUsage(admin, user.id, noteId, monthYear);
    const newUsed = used + 1;
    const remaining = Number.isFinite(limit) ? Math.max(0, (limit as number) - newUsed) : null;

    const response = {
      success: true,
      enhancedContent,
      usage: { used: newUsed, limit: Number.isFinite(limit) ? (limit as number) : null, remaining, monthYear },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("enrich-note error:", e?.message ?? e);
    return new Response(JSON.stringify({ success: false, error: "server_error", message: e?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
