import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscriptionRequest {
  audioUrl: string;
  language?: string;
  videoId?: string;
  title?: string;
}

interface GladiaResponse {
  prediction: string;
  prediction_raw?: {
    language: string;
    confidence: number;
    segments?: Array<{
      text: string;
      start: number;
      end: number;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, language = 'english', videoId, title }: TranscriptionRequest = await req.json();

    if (!audioUrl) {
      throw new Error('audioUrl is required');
    }

    console.log(`Starting transcription for audio: ${audioUrl}`);
    console.log(`Video ID: ${videoId}, Title: ${title}`);

    // Fetch the MP3 audio file from the provided URL
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio from URL: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    // Get the audio as an ArrayBuffer
    const audioBuffer = await audioResponse.arrayBuffer();
    console.log(`Audio file size: ${audioBuffer.byteLength} bytes`);

    // Create FormData for Gladia API
    const formData = new FormData();
    
    // Create a blob from the audio buffer
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    formData.append('audio', audioBlob, 'audio.mp3');
    formData.append('language', language);
    formData.append('output_format', 'json');

    // Call Gladia transcription API
    const gladiaApiKey = Deno.env.get('GLADIA_API_KEY');
    if (!gladiaApiKey) {
      throw new Error('GLADIA_API_KEY not configured');
    }

    console.log('Sending audio to Gladia for transcription...');
    
    const gladiaResponse = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
      method: 'POST',
      headers: {
        'x-gladia-key': gladiaApiKey,
      },
      body: formData,
    });

    if (!gladiaResponse.ok) {
      const errorText = await gladiaResponse.text();
      console.error('Gladia API error:', errorText);
      throw new Error(`Gladia API error: ${gladiaResponse.status} ${gladiaResponse.statusText}. Details: ${errorText}`);
    }

    const gladiaResult: GladiaResponse = await gladiaResponse.json();
    console.log('Transcription completed successfully');

    // Prepare the response
    const response = {
      success: true,
      transcription: gladiaResult.prediction,
      metadata: {
        videoId: videoId || null,
        title: title || null,
        audioUrl,
        language: gladiaResult.prediction_raw?.language || language,
        confidence: gladiaResult.prediction_raw?.confidence || null,
        segments: gladiaResult.prediction_raw?.segments || null,
        timestamp: new Date().toISOString(),
      }
    };

    console.log(`Transcription result: ${gladiaResult.prediction.substring(0, 100)}...`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in youtube-transcription function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});