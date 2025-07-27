import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscriptRequest {
  youtubeUrl: string;
  enhanceWithGladia?: boolean;
}

interface TranscriptResult {
  transcript: string;
  videoId: string;
  title: string;
  duration?: number;
  thumbnail?: string;
  enhanced?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl, enhanceWithGladia = false }: TranscriptRequest = await req.json();

    if (!youtubeUrl) {
      throw new Error('YouTube URL is required');
    }

    console.log(`Starting transcript extraction for: ${youtubeUrl}`);

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      throw new Error('APIFY_API_KEY not configured');
    }

    // Extract video ID from YouTube URL
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL format');
    }

    // Use synchronous Apify API with correct actor ID format (tilde instead of slash)
    const actorId = 'matthewjames~youtube-transcript-scraper-and-formatter';
    
    console.log('Starting Apify transcript extraction actor:', actorId);
    
    // Use synchronous endpoint to avoid polling complexity
    const syncResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startUrls: [{ url: youtubeUrl }],
        proxyConfiguration: { useApifyProxy: true },
        timeout: 300000, // 5 minutes timeout
      }),
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error('Apify synchronous run error:', errorText);
      throw new Error(`Failed to run Apify actor: ${syncResponse.status} ${syncResponse.statusText}. Details: ${errorText}`);
    }

    const apifyResults = await syncResponse.json();
    console.log('Transcript extraction completed, processing results...');

    if (!Array.isArray(apifyResults) || apifyResults.length === 0) {
      throw new Error('No transcript results returned from Apify actor');
    }

    // Process the first result
    const result = apifyResults[0];
    let rawTranscript = result.transcript || result.text || result.fullTranscript;
    
    if (!rawTranscript) {
      throw new Error('No transcript text found in the results');
    }

    console.log('Raw transcript extracted successfully');

    // Optional: Enhance with Gladia
    let finalTranscript = rawTranscript;
    let enhanced = false;

    if (enhanceWithGladia) {
      try {
        const gladiaApiKey = Deno.env.get('GLADIA_API_KEY');
        if (gladiaApiKey) {
          console.log('Enhancing transcript with Gladia...');
          
          const gladiaResponse = await fetch('https://api.gladia.io/v2/pre-recorded/', {
            method: 'POST',
            headers: {
              'x-gladia-key': gladiaApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: rawTranscript,
              detect_language: true,
              enable_code_switching: true,
            }),
          });

          if (gladiaResponse.ok) {
            const gladiaResult = await gladiaResponse.json();
            if (gladiaResult.prediction && gladiaResult.prediction.length > 0) {
              finalTranscript = gladiaResult.prediction[0].transcription || rawTranscript;
              enhanced = true;
              console.log('Transcript enhanced with Gladia');
            }
          } else {
            console.warn('Gladia enhancement failed, using raw transcript');
          }
        }
      } catch (error) {
        console.warn('Gladia enhancement error:', error);
        // Continue with raw transcript if Gladia fails
      }
    }

    // Build the final result
    const transcriptResult: TranscriptResult = {
      transcript: finalTranscript,
      videoId: videoId,
      title: result.title || `YouTube Video ${videoId}`,
      duration: result.duration,
      thumbnail: result.thumbnail,
      enhanced,
    };

    console.log(`Successfully extracted transcript for video: ${transcriptResult.title}`);

    const response = {
      success: true,
      result: transcriptResult,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in youtube-transcript-extraction function:', error);
    
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