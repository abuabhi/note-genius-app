
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createCorsResponse } from './cors.ts';
import { authenticateUser } from './auth.ts';
import { callOpenAI } from './openai.ts';
import { createPrompt } from './prompts.ts';
import type { EnrichmentRequestBody, ErrorResponse, EnhancementFunction, TokenUsage } from './types.ts';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

serve(async (req) => {
  const startTime = Date.now();
  console.log("🚀 Received request to enrich-note function");
  console.log("📋 Request details:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  // Set timeout to 45 seconds (before the 60s client timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Health check endpoint
  if (req.url.includes('/health')) {
    return createCorsResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      openaiConfigured: !!openaiApiKey,
      supabaseConfigured: !!(supabaseUrl && supabaseAnonKey)
    });
  }
  
  try {
    // Check if OpenAI API key is available
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key is not set');
      console.error('🔍 Environment check:', {
        hasOpenAIKey: !!openaiApiKey,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseAnonKey
      });
      return createCorsResponse(
        { error: 'OpenAI API key is not configured. Please check your environment variables.' } as ErrorResponse,
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
      console.error('❌ Authentication error:', authError);
      console.error('🔍 Auth details:', {
        hasAuthHeader: !!req.headers.get('Authorization'),
        authHeaderLength: req.headers.get('Authorization')?.length || 0,
        errorMessage: authError.message
      });
      return createCorsResponse(
        { 
          error: `Authentication failed: ${authError.message}`,
          details: 'Please check your authentication token'
        } as ErrorResponse,
        401
      );
    }
    
    // Parse request body
    let requestBody: EnrichmentRequestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", JSON.stringify({
        noteId: requestBody.noteId,
        enhancementType: requestBody.enhancementType,
        noteTitle: requestBody.noteTitle
      }));
    } catch (e) {
      console.error('Invalid JSON body:', e);
      return createCorsResponse(
        { error: 'Invalid JSON body' } as ErrorResponse,
        400
      );
    }
    
    const { noteId, noteContent, enhancementType, noteTitle } = requestBody;
    
    // Validate request parameters
    if (!noteId || !noteContent || !enhancementType) {
      console.error('Missing required parameters');
      return createCorsResponse(
        { error: 'Missing required parameters' } as ErrorResponse,
        400
      );
    }
    
    // Construct prompt and call OpenAI
    const prompt = createPrompt(enhancementType, noteTitle, noteContent);
    console.log("Calling OpenAI API with enhancement type:", enhancementType);
    
    let enhancedContent: string;
    let tokenUsage;
    
    try {
      const openAIResult = await callOpenAI(prompt, openaiApiKey, controller.signal);
      enhancedContent = openAIResult.enhancedContent;
      tokenUsage = openAIResult.tokenUsage;
      console.log("Enhancement successful. Content length:", enhancedContent.length);
      clearTimeout(timeoutId);
    } catch (openAIError) {
      clearTimeout(timeoutId);
      console.error('❌ OpenAI API error:', openAIError);
      
      if (controller.signal.aborted) {
        return createCorsResponse(
          { 
            error: 'Request timeout', 
            details: 'The enhancement request took too long. Please try with shorter content or try again later.'
          } as ErrorResponse,
          408
        );
      }
      
      return createCorsResponse(
        { 
          error: `AI service error: ${openAIError.message}`, 
          details: 'The AI service is experiencing issues. Please try again.'
        } as ErrorResponse,
        502
      );
    }
    
    // Return the enhanced content
    const duration = Date.now() - startTime;
    console.log(`✅ Enhancement completed successfully in ${duration}ms`);
    return createCorsResponse({ 
      enhancedContent,
      enhancementType,
      tokenUsage,
      processingTime: duration
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Critical error in enrich-note function:', error);
    console.error('🔍 Critical error details:', {
      errorType: typeof error,
      errorMessage: error.message,
      errorStack: error.stack,
      duration
    });
    return createCorsResponse(
      { 
        error: `Internal server error: ${error.message}`, 
        details: 'An unexpected error occurred in the enhancement service',
        timestamp: new Date().toISOString()
      } as ErrorResponse,
      500
    );
  }
});
