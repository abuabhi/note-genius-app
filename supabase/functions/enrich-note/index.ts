
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Supported enhancement functions
type EnhancementFunction = 
  | 'summarize' 
  | 'addKeyPoints' 
  | 'explainConcepts' 
  | 'suggestQuestions' 
  | 'addExamples'
  | 'improvePhrasing';

// Mapping of enhancement functions to structured prompts
const enhancementPrompts: Record<EnhancementFunction, string> = {
  summarize: "Create a concise summary of the following note content:",
  addKeyPoints: "Extract and list the key points from the following note content:",
  explainConcepts: "Identify and explain the main concepts from the following note content:",
  suggestQuestions: "Generate study questions based on the following note content:",
  addExamples: "Provide relevant examples to illustrate the concepts in the following note content:",
  improvePhrasing: "Rewrite the following note content to improve clarity and readability while preserving all information:"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Extract auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { noteId, noteContent, enhancementType, noteTitle } = await req.json();
    
    if (!noteId || !noteContent || !enhancementType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if enhancement type is valid
    if (!Object.keys(enhancementPrompts).includes(enhancementType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid enhancement type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has access to note enrichment feature
    const { data: tierData, error: tierError } = await supabase
      .from('tier_limits')
      .select('note_enrichment_enabled, note_enrichment_limit_per_month')
      .eq('tier', (await supabase
        .from('profiles')
        .select('user_tier')
        .eq('id', user.id)
        .single()).data?.user_tier ?? 'SCHOLAR')
      .single();
    
    if (tierError || !tierData?.note_enrichment_enabled) {
      return new Response(
        JSON.stringify({ error: 'Note enrichment not available for your tier' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const { data: usageData, error: usageError } = await supabase
      .from('note_enrichment_usage')
      .select('id')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth);
    
    if (!usageError && usageData && usageData.length >= tierData.note_enrichment_limit_per_month) {
      return new Response(
        JSON.stringify({ error: 'Monthly note enrichment limit reached' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Construct prompt based on enhancement type
    const prompt = `${enhancementPrompts[enhancementType as EnhancementFunction]}
    
Note Title: ${noteTitle || 'Untitled Note'}

Content:
${noteContent}

Response Guidelines:
- Provide a structured, concise response
- Use objective language and maintain academic tone
- Format using basic markdown for readability where appropriate
- Focus on the most important concepts from the provided content`;
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert educational assistant that helps improve study notes.' },
          { role: 'user', content: prompt }
        ],
      }),
    });
    
    // Check if the response is valid before trying to parse JSON
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${openAIResponse.status}`, 
          details: errorText
        }),
        { status: openAIResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Try to parse the response safely
    let openAIData;
    try {
      openAIData = await openAIResponse.json();
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse API response', details: parseError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API', details: openAIData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const enhancedContent = openAIData.choices[0].message.content;
    const tokenUsage: TokenUsage = openAIData.usage;
    
    // Record usage
    const { error: recordError } = await supabase
      .from('note_enrichment_usage')
      .insert({
        user_id: user.id,
        note_id: noteId,
        llm_provider: 'openai',
        prompt_tokens: tokenUsage.prompt_tokens,
        completion_tokens: tokenUsage.completion_tokens,
        month_year: currentMonth,
      });
    
    if (recordError) {
      console.error('Failed to record usage:', recordError);
    }
    
    // Return the enhanced content with additional error handling
    return new Response(
      JSON.stringify({ 
        enhancedContent,
        enhancementType,
        tokenUsage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in enrich-note function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
