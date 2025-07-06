import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// n8n webhook URL for YouTube transcription
const N8N_WEBHOOK_URL = 'https://n8n.srv538007.hstgr.cloud/webhook-test/sWcYmc7znvGIs5Vo/youtube%20webhook/youtube-transcribe';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl, userId, noteTitle } = await req.json();
    
    if (!youtubeUrl) {
      throw new Error('YouTube URL is required');
    }

    console.log('🎬 Starting n8n YouTube transcription for:', youtubeUrl);

    // Generate unique request ID for tracking
    const requestId = crypto.randomUUID();

    // Call n8n webhook for asynchronous processing
    console.log('📤 Sending request to n8n webhook...');
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtubeUrl: youtubeUrl.trim(),
        userId: userId,
        requestId: requestId,
        noteTitle: noteTitle
      })
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ n8n webhook failed:', errorText);
      throw new Error(`n8n service error: ${n8nResponse.status} - ${errorText}`);
    }

    const n8nData = await n8nResponse.json();
    console.log('✅ n8n webhook response:', n8nData);

    // Check if n8n returned the data immediately (fast processing)
    // or if we need to poll for results (async processing)
    if (n8nData.success && n8nData.transcript) {
      // Immediate response - return the data
      console.log('🎉 Immediate transcription response from n8n');
      return new Response(JSON.stringify({
        success: true,
        requestId,
        videoTitle: n8nData.videoTitle || 'YouTube Video',
        transcript: n8nData.transcript,
        summary: n8nData.summary || '',
        videoMetadata: n8nData.videoMetadata || {},
        processingTime: 0, // Immediate
        processingStatus: 'completed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (n8nData.processing) {
      // Async processing started - return processing status
      console.log('⏳ Async processing started - will take 1-5 minutes');
      return new Response(JSON.stringify({
        success: true,
        requestId,
        processingStatus: 'processing',
        estimatedTime: '1-5 minutes',
        message: 'Your video is being processed. This may take 1-5 minutes depending on video length.',
        pollUrl: `/functions/v1/youtube-transcription-status?requestId=${requestId}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Unexpected response from n8n service');
    }

  } catch (error) {
    console.error('💥 YouTube transcription error:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    let errorType = 'unknown';
    
    if (error.message.includes('n8n service error')) {
      errorType = 'service_unavailable';
      userMessage = 'The transcription service is temporarily unavailable. Please try again in a few minutes.';
    } else if (error.message.includes('YouTube URL is required')) {
      errorType = 'invalid_input';
      userMessage = 'Please provide a valid YouTube URL.';
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: userMessage,
      errorType,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        suggestions: [
          'Check that the YouTube URL is valid and accessible',
          'Ensure the video is public and not age-restricted',
          'Try again in a few minutes if the service is busy',
          'Contact support if the issue persists'
        ]
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});