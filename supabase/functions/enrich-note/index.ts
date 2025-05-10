
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createCorsResponse } from './cors.ts';
import { authenticateUser } from './auth.ts';
import { callOpenAI } from './openai.ts';
import { createPrompt, enhancementPrompts } from './prompts.ts';
import { EnrichmentRequestBody, ErrorResponse } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

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
      return createCorsResponse(
        { error: 'OpenAI API key is not configured' } as ErrorResponse,
        500
      );
    }
    
    // Authenticate user
    let userId: string;
    try {
      userId = await authenticateUser(
        req.headers.get('Authorization'),
        supabaseUrl,
        supabaseAnonKey
      );
      console.log("User authenticated:", userId);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return createCorsResponse(
        { error: authError.message } as ErrorResponse,
        401
      );
    }
    
    // Parse request body
    let requestBody: EnrichmentRequestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", JSON.stringify(requestBody));
    } catch (e) {
      console.error('Invalid JSON body:', e);
      return createCorsResponse(
        { error: 'Invalid JSON body' } as ErrorResponse,
        400
      );
    }
    
    const { noteId, noteContent, enhancementType, noteTitle, noteCategory } = requestBody;
    
    // Validate request parameters
    if (!noteId || !noteContent || !enhancementType) {
      console.error('Missing required parameters');
      return createCorsResponse(
        { error: 'Missing required parameters' } as ErrorResponse,
        400
      );
    }
    
    // Check if enhancement type is valid
    if (!Object.keys(enhancementPrompts).includes(enhancementType)) {
      console.error('Invalid enhancement type:', enhancementType);
      return createCorsResponse(
        { error: 'Invalid enhancement type' } as ErrorResponse,
        400
      );
    }

    // For demonstration purposes, let's assume all users have access to this feature
    // In production, you would check user permissions here
    const isFeatureEnabled = true;
    const monthlyLimit = 100;
    
    // Construct prompt and call OpenAI
    const prompt = createPrompt(enhancementType, noteTitle, noteContent);
    console.log("Calling OpenAI API");
    
    let enhancedContent: string;
    let tokenUsage;
    
    try {
      const openAIResult = await callOpenAI(prompt, openaiApiKey);
      enhancedContent = openAIResult.enhancedContent;
      tokenUsage = openAIResult.tokenUsage;
      console.log("Enhancement successful. Token usage:", tokenUsage);
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      return createCorsResponse(
        { 
          error: 'OpenAI API error', 
          details: openAIError.message 
        } as ErrorResponse,
        502
      );
    }
    
    // Return the enhanced content
    return createCorsResponse({ 
      enhancedContent,
      enhancementType,
      tokenUsage 
    });
    
  } catch (error) {
    console.error('Error in enrich-note function:', error);
    return createCorsResponse(
      { error: 'Internal server error', details: error.message } as ErrorResponse,
      500
    );
  }
});
