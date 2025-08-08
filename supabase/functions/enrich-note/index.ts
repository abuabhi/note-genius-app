
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders, createCorsResponse } from './cors.ts';
import { authenticateUser } from './auth.ts';
import { callOpenAI, detectProblematicContent } from './openai.ts';
import { createPrompt, getTokenLimit, getModel } from './prompts.ts';
import { processLargeContent } from './chunking.ts';
import { processLargeContentStandardized } from './content-processor.ts';
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
    
    // Proactive content scanning for problematic patterns
    console.log(`🔍 [${requestId}] Scanning content for problematic patterns...`);
    const contentCheck = detectProblematicContent(noteContent);
    if (contentCheck.isProblematic) {
      console.warn(`⚠️ [${requestId}] Potentially problematic content detected:`, contentCheck.warnings);
      return createCorsResponse({
        error: 'Content contains patterns that may be rejected by AI safety filters',
        warnings: contentCheck.warnings,
        suggestions: [
          'Consider rephrasing marketing language to be more neutral',
          'Replace sales terminology with educational language',
          'Remove references to mass outreach or cold emails',
          'Use informational tone instead of persuasive marketing'
        ],
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
      // **STANDARDIZED CONTENT PROCESSING LOGIC**
      
      // Determine processing method based on content size and enhancement type
      const contentLength = noteContent.length;
      const estimatedTokens = Math.ceil(contentLength / 4);
      const tokenLimit = getTokenLimit(enhancementType);
      const model = getModel(enhancementType);
      
      console.log(`📊 [${requestId}] Content analysis: ${contentLength} chars, ~${estimatedTokens} tokens, limit: ${tokenLimit}, model: ${model}`);
      
      // Use standardized large content processing for appropriate cases
      if (estimatedTokens > 3000 || contentLength > 12000) {
        console.log(`📚 [${requestId}] Large content detected, using standardized chunking approach`);
        const result = await processLargeContentStandardized(noteContent, enhancementType, noteTitle, openaiApiKey, controller.signal);
        enhancedContent = result.enhancedContent;
        tokenUsage = result.tokenUsage;
        processingStats = { 
          method: 'standardized_chunking', 
          reason: 'content_exceeds_optimal_size',
          model,
          tokenLimit
        };
      } else {
        console.log(`📝 [${requestId}] Standard content processing with optimized settings`);
        
        // Use standardized prompt and model selection
        const prompt = createPrompt(enhancementType, noteTitle, noteContent);
        console.log(`🤖 [${requestId}] Using ${model} with token limit ${tokenLimit}`);
        
        // Call OpenAI with standardized settings
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are an expert educational content enhancer specializing in ${enhancementType}. Create high-quality, export-safe content that renders perfectly in PDF, DOCX, and web formats. Follow the formatting requirements exactly.`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: tokenLimit,
            stream: false
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [${requestId}] OpenAI API error:`, response.status, errorText);
          throw new Error(`AI service error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        enhancedContent = data.choices[0].message.content;
        tokenUsage = data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0
        } : undefined;
        
        processingStats = { 
          method: 'standardized_single_call', 
          model,
          tokenLimit
        };
      }
      
      clearTimeout(timeoutId);
      console.log(`✅ [${requestId}] Enhancement successful:`, {
        originalLength: noteContent.length,
        enhancedLength: enhancedContent.length,
        tokenUsage,
        processingTime: Date.now() - startTime,
        ...processingStats
      });
      
      // Track AI enrichment usage
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        const currentDate = new Date();
        const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const { error: usageError } = await supabase
          .from('note_enrichment_usage')
          .insert({
            user_id: user!.id,
            note_id: noteId,
            enhancement_type: enhancementType,
            tokens_used: tokenUsage?.totalTokens || 0,
            month_year: monthYear,
            llm_provider: 'openai'
          });
          
        if (usageError) {
          console.error(`❌ [${requestId}] Failed to record usage:`, usageError);
        } else {
          console.log(`✅ [${requestId}] Usage tracked successfully`);
        }
      } catch (trackingError) {
        console.error(`❌ [${requestId}] Error tracking usage:`, trackingError);
      }
      
    } catch (openAIError) {
      clearTimeout(timeoutId);
      console.error(`❌ [${requestId}] Enhancement processing error:`, {
        error: openAIError.message,
        errorName: openAIError.name,
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
      
      // Handle content policy violations with helpful error messages
      if (openAIError.name === 'ContentPolicyError') {
        console.warn(`🚫 [${requestId}] Content policy violation:`, openAIError.message);
        return createCorsResponse({
          error: 'Content Policy Violation',
          message: openAIError.message,
          suggestions: openAIError.suggestions,
          help: {
            reason: 'Your content contains language that triggers AI safety filters',
            commonTriggers: [
              'Aggressive sales language ("guaranteed", "instant results")',
              'Mass email/outreach terminology',
              'Spam-like promotional content',
              'Income claims or get-rich-quick schemes'
            ],
            nextSteps: [
              'Rephrase the content using more neutral, educational language',
              'Replace marketing terms with informational equivalents',
              'Focus on educational value rather than persuasive tactics'
            ]
          },
          requestId,
          processingTime: Date.now() - startTime
        }, 400);
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
