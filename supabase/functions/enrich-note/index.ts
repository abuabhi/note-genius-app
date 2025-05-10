
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

// Mapping of enhancement functions from client to the prompts used by the API
const enhancementPrompts: Record<string, string> = {
  'summarize': "Create a concise summary of the following note content:",
  'extract-key-points': "Extract and list the key points from the following note content:",
  'generate-questions': "Generate study questions based on the following note content:",
  'improve-clarity': "Rewrite the following note content to improve clarity and readability while preserving all information:",
  'convert-to-markdown': "Format the following note content with proper Markdown styling:",
  'fix-spelling-grammar': "Correct spelling and grammar errors in the following note content while preserving the meaning:"
};

serve(async (req) => {
  console.log("Received request to enrich-note function");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Check if OpenAI API key is available
    if (!openaiApiKey) {
      console.error('OpenAI API key is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Extract auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
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
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("User authenticated:", user.id);
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", JSON.stringify(requestBody));
    } catch (e) {
      console.error('Invalid JSON body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { noteId, noteContent, enhancementType, noteTitle } = requestBody;
    
    if (!noteId || !noteContent || !enhancementType) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if enhancement type is valid
    if (!Object.keys(enhancementPrompts).includes(enhancementType)) {
      console.error('Invalid enhancement type:', enhancementType);
      return new Response(
        JSON.stringify({ error: 'Invalid enhancement type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For demonstration purposes, let's assume all users have access to this feature
    // In production, you would check user permissions here
    const isFeatureEnabled = true;
    const monthlyLimit = 100;
    
    // Construct prompt based on enhancement type
    const prompt = `${enhancementPrompts[enhancementType]}
    
Note Title: ${noteTitle || 'Untitled Note'}

Content:
${noteContent}

Response Guidelines:
- Provide a structured, concise response
- Use objective language and maintain academic tone
- Format using basic markdown for readability where appropriate
- Focus on the most important concepts from the provided content`;

    console.log("Calling OpenAI API");
    
    // Call OpenAI API with error handling
    let openAIResponse;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
    } catch (error) {
      console.error('OpenAI API network error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to connect to OpenAI API' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("OpenAI API response status:", openAIResponse.status);
    
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
      console.log("OpenAI API response parsed successfully");
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse API response', details: parseError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      console.error('Invalid response from OpenAI API:', openAIData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API', details: openAIData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const enhancedContent = openAIData.choices[0].message.content;
    const tokenUsage: TokenUsage = openAIData.usage || { 
      prompt_tokens: 0,
      completion_tokens: 0, 
      total_tokens: 0
    };
    
    console.log("Enhancement successful. Token usage:", tokenUsage);
    
    // Return the enhanced content
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
