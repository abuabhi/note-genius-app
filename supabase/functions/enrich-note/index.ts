
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
  const requestId = crypto.randomUUID();
  
  console.log(`🚀 [${requestId}] Enhancement request started at ${new Date().toISOString()}`);
  console.log(`📋 Request details:`, {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS preflight handled for ${requestId}`);
    return new Response(null, { headers: corsHeaders });
  }
  
  // Health check endpoint
  if (req.url.includes('/health')) {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      openaiConfigured: !!openaiApiKey,
      supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
      version: '3.0.0',
      requestId
    };
    console.log(`🏥 Health check successful:`, healthData);
    return createCorsResponse(healthData);
  }
  
  try {
    // Enhanced OpenAI API key validation
    if (!openaiApiKey) {
      const error = 'OpenAI API key is not configured. Please check your environment variables.';
      console.error(`❌ [${requestId}] ${error}`);
      console.error(`🔍 Environment check:`, {
        hasOpenAIKey: !!openaiApiKey,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseAnonKey,
        nodeEnv: Deno.env.get('NODE_ENV') || 'not-set'
      });
      return createCorsResponse({ 
        error, 
        requestId,
        troubleshooting: 'Check edge function environment variables configuration'
      }, 500);
    }
    
    // Enhanced authentication with better error handling
    console.log(`🔐 [${requestId}] Authenticating user...`);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`❌ [${requestId}] No authorization header provided`);
      return createCorsResponse({ 
        error: 'Authorization header is required',
        requestId 
      }, { status: 401 });
    }
    
    const userResult = await authenticateUser(authHeader, supabaseUrl, supabaseAnonKey);
    
    if (!userResult.success) {
      console.error(`❌ [${requestId}] Authentication failed:`, userResult.error);
      return createCorsResponse({ 
        error: userResult.error, 
        requestId 
      }, { status: 401 });
    }

    const { user, userTier } = userResult;
    console.log(`✅ [${requestId}] User authenticated: ${user!.id} (${userTier})`);
    
    // Enhanced rate limiting with detailed logging
    console.log(`⏱️ [${requestId}] Checking rate limits...`);
    const rateLimitResult = checkRateLimit(user!.id, userTier);
    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ [${requestId}] Rate limit exceeded for user ${user!.id}:`, rateLimitResult.message);
      return createCorsResponse({
        error: rateLimitResult.message || 'Rate limit exceeded',
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        requestId
      }, { status: 429 });
    }
    
    console.log(`✅ [${requestId}] Rate limit check passed:`, {
      remaining: rateLimitResult.remaining,
      resetTime: new Date(rateLimitResult.resetTime).toISOString()
    });
    
    // Enhanced request body parsing with comprehensive validation
    console.log(`📝 [${requestId}] Parsing request body...`);
    let requestBody: EnrichmentRequestBody;
    try {
      const rawBody = await req.text();
      console.log(`📋 [${requestId}] Raw body received:`, {
        length: rawBody.length,
        preview: rawBody.substring(0, 200) + (rawBody.length > 200 ? '...' : ''),
        isEmpty: rawBody.length === 0,
        isContentTypeJSON: req.headers.get('content-type')?.includes('application/json')
      });
      
      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      requestBody = JSON.parse(rawBody);
      console.log(`✅ [${requestId}] Request body parsed:`, {
        noteId: requestBody.noteId?.substring(0, 8) + '...',
        enhancementType: requestBody.enhancementType,
        noteTitle: requestBody.noteTitle?.substring(0, 50) + '...',
        contentLength: requestBody.noteContent?.length || 0,
        hasContent: !!requestBody.noteContent
      });
    } catch (e) {
      console.error(`❌ [${requestId}] Invalid JSON body:`, e);
      return createCorsResponse({
        error: 'Invalid JSON body',
        details: e.message,
        requestId
      }, 400);
    }
    
    const { noteId, noteContent, enhancementType, noteTitle } = requestBody;
    
    // Comprehensive validation with specific error messages
    const validationErrors = [];
    if (!noteId) validationErrors.push('noteId is required');
    if (!noteContent) validationErrors.push('noteContent is required');
    if (!enhancementType) validationErrors.push('enhancementType is required');
    if (noteContent && noteContent.length < 10) validationErrors.push('noteContent must be at least 10 characters');
    if (noteContent && noteContent.length > 100000) validationErrors.push('noteContent must be less than 100,000 characters');
    
    if (validationErrors.length > 0) {
      console.error(`❌ [${requestId}] Validation failed:`, validationErrors);
      return createCorsResponse({
        error: 'Validation failed',
        details: validationErrors,
        requestId
      }, 400);
    }
    
    // Enhanced content processing with timeout management
    console.log(`🔄 [${requestId}] Processing content (${noteContent.length} characters)...`);
    
    // Set up abort controller for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`❌ [${requestId}] Processing timeout after 60 seconds`);
      controller.abort();
    }, 60000); // 60 second timeout for two-pass processing
    
    let enhancedContent: string;
    let tokenUsage;
    let processingStats = {};
    
    try {
      if (enhancementType === 'enrich-note') {
        if (noteContent.length > 15000) {
          console.log(`📚 [${requestId}] Large content for enrich-note detected (${noteContent.length} chars), using optimized chunking`);
          const result = await processLargeContent(noteContent, enhancementType, noteTitle, openaiApiKey, controller.signal);
          enhancedContent = result.enhancedContent;
          tokenUsage = result.tokenUsage;
          processingStats = { method: 'optimized_chunking', reason: 'content_too_large_for_enrichment' };
        } else {
          console.log(`🚀 [${requestId}] Using Two-Pass Enhancement System`);
          const { performTwoPassEnhancement } = await import('./two-pass-enhancement.ts');
          
          const result = await performTwoPassEnhancement(noteContent, noteTitle, openaiApiKey, controller.signal);
          enhancedContent = result.enhancedContent;
          
          // Estimate token usage for two-pass system
          const estimatedTokens = Math.ceil((noteContent.length + enhancedContent.length) / 3);
          tokenUsage = {
            promptTokens: Math.ceil(noteContent.length / 3),
            completionTokens: Math.ceil((enhancedContent.length - noteContent.length) / 3),
            totalTokens: estimatedTokens
          };
          
          processingStats = {
            conceptsExtracted: result.conceptsExtracted,
            enhancementsAdded: result.enhancementsAdded,
            method: 'two-pass-enhancement'
          };
        }
      } else if (noteContent.length > 30000) {
        console.log(`📚 [${requestId}] Large content detected, using chunking approach`);
        const result = await processLargeContent(noteContent, enhancementType, noteTitle, openaiApiKey, controller.signal);
        enhancedContent = result.enhancedContent;
        tokenUsage = result.tokenUsage;
        processingStats = { method: 'chunking', reason: 'content_exceeds_standard_limit' };
      } else {
        console.log(`📝 [${requestId}] Standard content processing (${noteContent.length} chars)`);
        const prompt = createPrompt(enhancementType, noteTitle, noteContent);
        console.log(`🤖 [${requestId}] Calling OpenAI API with prompt length: ${prompt.length}`);
        const openAIResult = await callOpenAI(prompt, openaiApiKey, controller.signal);
        enhancedContent = openAIResult.enhancedContent;
        tokenUsage = openAIResult.tokenUsage;
        processingStats = { method: 'standard' };
      }
      
      clearTimeout(timeoutId);
      console.log(`✅ [${requestId}] Enhancement successful:`, {
        originalLength: noteContent.length,
        enhancedLength: enhancedContent.length,
        tokenUsage,
        processingTime: Date.now() - startTime,
        ...processingStats
      });
      
    } catch (openAIError) {
      clearTimeout(timeoutId);
      console.error(`❌ [${requestId}] Enhancement processing error:`, {
        error: openAIError.message,
        stack: openAIError.stack,
        aborted: controller.signal.aborted,
        processingTime: Date.now() - startTime
      });
      
      if (controller.signal.aborted) {
        return createCorsResponse({
          error: 'Request timeout',
          details: 'The enhancement request took too long. Please try with shorter content or try again later.',
          requestId,
          processingTime: Date.now() - startTime
        }, 408);
      }
      
      return createCorsResponse({
        error: `AI service error: ${openAIError.message}`,
        details: 'The AI service is experiencing issues. Please try again.',
        requestId,
        processingTime: Date.now() - startTime
      }, 502);
    }
    
    // Prepare comprehensive response
    const duration = Date.now() - startTime;
    const responseHeaders = {
      ...corsHeaders,
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      'X-Request-ID': requestId,
      'X-Processing-Time': duration.toString()
    };

    console.log(`✅ [${requestId}] Request completed successfully:`, {
      userId: user!.id,
      enhancementType,
      processingTime: duration,
      tokenUsage,
      wasLargeContent: noteContent.length > 30000,
      rateLimitRemaining: rateLimitResult.remaining,
      enhancedContentLength: enhancedContent.length
    });

    // Trigger cleanup occasionally (5% chance)
    if (Math.random() < 0.05) {
      setTimeout(() => {
        console.log(`🧹 [${requestId}] Triggering cleanup...`);
        cleanupRateLimitStore();
      }, 0);
    }

    return createCorsResponse({
      enhancedContent,
      tokenUsage,
      processingTime: duration,
      requestId,
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }
    }, { headers: responseHeaders });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Critical error in enrich-note function:`, {
      errorType: typeof error,
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      duration,
      timestamp: new Date().toISOString()
    });
    
    return createCorsResponse({
      error: `Internal server error: ${error.message}`,
      details: 'An unexpected error occurred in the enhancement service',
      requestId,
      processingTime: duration,
      timestamp: new Date().toISOString(),
      troubleshooting: 'Check edge function logs for detailed error information'
    }, 500);
  }
});
