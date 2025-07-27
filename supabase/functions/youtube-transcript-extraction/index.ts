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

    // Call Apify actor for transcript extraction
    const actorId = 'matthewjames/youtube-transcript-scraper-and-formatter';
    
    console.log('Starting Apify transcript extraction actor:', actorId);
    
    // Start the actor run
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrls: [{ url: youtubeUrl }],
        proxyConfiguration: { useApifyProxy: true },
        timeout: 300000, // 5 minutes timeout
      }),
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Apify run start error:', errorText);
      throw new Error(`Failed to start Apify actor: ${runResponse.status} ${runResponse.statusText}. Details: ${errorText}`);
    }

    const runData = await runResponse.json();
    console.log('Actor run started with ID:', runData.data.id);

    // Poll for run completion with timeout
    const runId = runData.data.id;
    const maxWaitTime = 300000; // 5 minutes
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();
    
    let runStatus = 'RUNNING';
    console.log('Waiting for transcript extraction to complete...');
    
    while (runStatus === 'RUNNING' && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apifyApiKey}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      runStatus = statusData.data.status;
      console.log(`Transcript extraction status: ${runStatus}`);
    }
    
    if (runStatus !== 'SUCCEEDED') {
      throw new Error(`Transcript extraction failed or timed out. Final status: ${runStatus}`);
    }
    
    console.log('Transcript extraction completed successfully, fetching results...');
    
    // Fetch the dataset items
    const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset-items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
      },
    });

    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text();
      console.error('Apify dataset fetch error:', errorText);
      throw new Error(`Failed to fetch transcript results: ${datasetResponse.status} ${datasetResponse.statusText}. Details: ${errorText}`);
    }

    const apifyResults = await datasetResponse.json();
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