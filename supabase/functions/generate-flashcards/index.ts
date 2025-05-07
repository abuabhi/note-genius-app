
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get auth header from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user tier
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profiles) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user profile', details: profileError?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has premium tier
    const userTier = profiles.user_tier;
    if (userTier !== 'PROFESSOR' && userTier !== 'DEAN') {
      return new Response(
        JSON.stringify({ error: 'Premium feature requires Professor or Dean tier' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { noteContent, count = 5, subject } = await req.json();

    if (!noteContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: noteContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare prompt for flashcard generation
    const systemMessage = `You are an educational AI assistant specialized in creating flashcards from notes. Create ${count} high-quality flashcards using the following guidelines:
    - Each flashcard should have a concise question/prompt on the front and a clear answer on the back
    - Focus on key concepts, definitions, and important facts
    - Ensure the content is accurate and educational
    - Format the response as a JSON array of objects with 'front' and 'back' properties
    - Keep the front side concise (under 150 characters) and the back side clear but comprehensive (under 500 characters)
    - Do not include any markdown, HTML, or other formatting in the response`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `Subject: ${subject || 'General'}\n\nNotes content:\n${noteContent}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Parse the generated flashcards
    let flashcards;
    try {
      flashcards = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      // Attempt to extract JSON if it's wrapped in text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          flashcards = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error("Failed to extract JSON:", innerError);
          flashcards = [];
        }
      } else {
        flashcards = [];
      }
    }

    // Return the generated flashcards
    return new Response(
      JSON.stringify({ flashcards }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
