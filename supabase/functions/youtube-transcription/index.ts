import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const gladiaApiKey = Deno.env.get('GLADIA_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl } = await req.json();
    
    if (!youtubeUrl) {
      throw new Error('YouTube URL is required');
    }

    console.log('🎬 Starting Gladia.io YouTube transcription for:', youtubeUrl);

    // Call Gladia.io API for transcription
    console.log('📤 Sending request to Gladia.io API...');
    const gladiaResponse = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
      method: 'POST',
      headers: {
        'x-gladia-key': gladiaApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: youtubeUrl.trim(),
        language: 'auto'
      })
    });

    if (!gladiaResponse.ok) {
      const errorText = await gladiaResponse.text();
      console.error('❌ Gladia.io API failed:', errorText);
      console.error('Response status:', gladiaResponse.status);
      console.error('Response headers:', Object.fromEntries(gladiaResponse.headers.entries()));
      
      throw new Error(`Gladia.io API error: ${gladiaResponse.status} - ${errorText}`);
    }

    const gladiaData = await gladiaResponse.json();
    console.log('✅ Gladia.io API response:', gladiaData);

    // Extract transcription data from Gladia.io response
    const transcript = gladiaData.prediction || gladiaData.transcription || '';
    const videoTitle = gladiaData.metadata?.title || 'YouTube Video';
    const videoMetadata = {
      title: videoTitle,
      duration: gladiaData.metadata?.duration,
      language: gladiaData.language,
      confidence: gladiaData.confidence
    };

    console.log('🎉 Transcription completed successfully');
    return new Response(JSON.stringify({
      success: true,
      videoTitle,
      transcript,
      summary: '', // Gladia.io doesn't provide summary by default
      videoMetadata,
      processingStatus: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 YouTube transcription error:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    let errorType = 'unknown';
    
    if (error.message.includes('Gladia.io API error')) {
      errorType = 'api_error';
      userMessage = 'The transcription service encountered an error. Please try again or contact support if the issue persists.';
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