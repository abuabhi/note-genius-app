
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createCorsResponse } from './cors.ts';
import { authenticateUser } from './auth.ts';
import { callOpenAI } from './openai.ts';
import { createPrompt } from './prompts.ts';
import { processLargeContent } from './chunking.ts';
import { checkRateLimit, cleanupRateLimitStore, getRateLimitStatus } from './rate-limiter.ts';
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
  
  // Set timeout to 50 seconds (optimized for concurrent processing)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000);
  
  // Add request tracking
  const requestId = crypto.randomUUID();
  console.log(`📊 [${requestId}] Request started at ${new Date().toISOString()}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Health check endpoint
  if (req.url.includes('/health')) {
    clearTimeout(timeoutId);
    return createCorsResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      openaiConfigured: !!openaiApiKey,
      supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
      version: '2.0.0'
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
    const userResult = await authenticateUser(req.headers.get('Authorization'), supabaseUrl, supabaseAnonKey);
    
    if (!userResult.success) {
      clearTimeout(timeoutId);
      console.error('❌ Authentication failed:', userResult.error);
      return createCorsResponse({ error: userResult.error }, { status: 401 });
    }

    const { user, userTier } = userResult;
    
    // Check rate limiting
    const rateLimitResult = checkRateLimit(user!.id, userTier);
    if (!rateLimitResult.allowed) {
      clearTimeout(timeoutId);
      console.warn(`⚠️ Rate limit exceeded for user ${user!.id}:`, rateLimitResult.message);
      return createCorsResponse(
        { 
          error: rateLimitResult.message || 'Rate limit exceeded',
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }, 
        { status: 429 }
      );
    }
    
    console.log(`✅ Rate limit check passed for user ${user!.id}:`, {
      remaining: rateLimitResult.remaining,
      resetTime: new Date(rateLimitResult.resetTime).toISOString()
    });
    
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
    
    // Handle large content with chunking
    console.log(`Content length: ${noteContent.length} characters`);
    
    let enhancedContent: string;
    let tokenUsage;
    
    try {
      if (noteContent.length > 30000) {
        console.log("Large content detected, using chunking approach");
        const result = await processLargeContent(noteContent, enhancementType, noteTitle, openaiApiKey, controller.signal);
        enhancedContent = result.enhancedContent;
        tokenUsage = result.tokenUsage;
      } else {
        console.log("Standard content size, processing normally");
        const prompt = createPrompt(enhancementType, noteTitle, noteContent);
        const openAIResult = await callOpenAI(prompt, openaiApiKey, controller.signal);
        enhancedContent = openAIResult.enhancedContent;
        tokenUsage = openAIResult.tokenUsage;
      }
      
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
    
    // Add response headers for rate limiting info
    const responseHeaders = {
      ...corsHeaders,
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      'X-Request-ID': requestId
    };

    const duration = Date.now() - startTime;
    console.log("✅ Request completed successfully", {
      requestId,
      userId: user!.id,
      enhancementType,
      processingTime: duration,
      tokenUsage,
      wasLargeContent: noteContent.length > 30000,
      rateLimitRemaining: rateLimitResult.remaining
    });

    // Trigger cleanup occasionally (5% chance)
    if (Math.random() < 0.05) {
      setTimeout(() => cleanupRateLimitStore(), 0);
    }

    return createCorsResponse({
      enhancedContent,
      tokenUsage,
      processingTime: duration,
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    }, { headers: responseHeaders });
    
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
