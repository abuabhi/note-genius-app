import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApifyRequest {
  youtubeUrls: Array<{ url: string }>;
  format?: string;
}

interface ApifyResult {
  audioUrl: string;
  videoId: string;
  title: string;
  duration?: number;
  thumbnail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrls, format = 'mp3' }: ApifyRequest = await req.json();

    if (!youtubeUrls || !Array.isArray(youtubeUrls) || youtubeUrls.length === 0) {
      throw new Error('youtubeUrls array is required');
    }

    console.log(`Starting Apify actor for ${youtubeUrls.length} URLs...`);

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      throw new Error('APIFY_API_KEY not configured');
    }

    // Call Apify actor: transcriptdl/transcript-downloader-youtube-audio-scraper
    const actorId = 'transcriptdl/transcript-downloader-youtube-audio-scraper';
    
    console.log('Starting Apify actor run:', actorId);
    
    // Start the actor run
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtubeUrls: youtubeUrls,
        format: format,
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

    // Wait for the run to complete and get dataset items
    const waitResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runData.data.id}/dataset-items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
      },
    });

    if (!waitResponse.ok) {
      const errorText = await waitResponse.text();
      console.error('Apify dataset fetch error:', errorText);
      throw new Error(`Failed to fetch Apify results: ${waitResponse.status} ${waitResponse.statusText}. Details: ${errorText}`);
    }

    const apifyResults = await waitResponse.json();
    console.log('Apify actor completed, processing results...');

    if (!Array.isArray(apifyResults) || apifyResults.length === 0) {
      throw new Error('No results returned from Apify actor');
    }

    // Process and validate results
    const processedResults: ApifyResult[] = [];
    
    for (const result of apifyResults) {
      if (result.audioUrl && result.videoId) {
        processedResults.push({
          audioUrl: result.audioUrl,
          videoId: result.videoId,
          title: result.title || `YouTube Video ${result.videoId}`,
          duration: result.duration,
          thumbnail: result.thumbnail,
        });
      } else {
        console.warn('Skipping invalid result:', result);
      }
    }

    if (processedResults.length === 0) {
      throw new Error('No valid audio URLs found in Apify results');
    }

    console.log(`Successfully extracted ${processedResults.length} audio URLs`);

    const response = {
      success: true,
      results: processedResults,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-youtube-audio function:', error);
    
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