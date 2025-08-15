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

    // Use correct Apify API with actor ID format (tilde instead of slash)
    const actorId = 'matthewjames~youtube-transcript-scraper-and-formatter';
    
    console.log('Starting Apify transcript extraction actor:', actorId);
    
    // Start asynchronous actor run (without waitForFinish)
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrls: [{ url: youtubeUrl }], // Actor expects videoUrls, not startUrls
        proxyConfiguration: { useApifyProxy: true },
      }),
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error('Apify run error:', errorText);
      throw new Error(`Failed to run Apify actor: ${runResponse.status} ${runResponse.statusText}. Details: ${errorText}`);
    }

    const runResult = await runResponse.json();
    const runId = runResult.data.id;
    console.log(`Actor run started with ID: ${runId}`);

    // Poll for completion with timeout (5 minutes max)
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();
    
    let runStatus = 'RUNNING';
    let datasetId = null;
    
    while (runStatus === 'RUNNING' && (Date.now() - startTime) < maxWaitTime) {
      console.log(`Checking run status... (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
      
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${apifyApiKey}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.status}`);
      }
      
      const statusResult = await statusResponse.json();
      runStatus = statusResult.data.status;
      datasetId = statusResult.data.defaultDatasetId;
      
      console.log(`Run status: ${runStatus}`);
      
      if (runStatus === 'RUNNING') {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    if (runStatus === 'RUNNING') {
      throw new Error('Actor run timed out after 5 minutes');
    }
    
    if (runStatus !== 'SUCCEEDED') {
      throw new Error(`Actor run failed with status: ${runStatus}`);
    }
    
    if (!datasetId) {
      throw new Error('No dataset ID returned from completed actor run');
    }
    
    console.log('Actor run completed successfully, fetching dataset...');

    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apifyApiKey}`,
      },
    });

    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text();
      console.error('Dataset fetch error:', errorText);
      throw new Error(`Failed to fetch dataset: ${datasetResponse.status} ${datasetResponse.statusText}. Details: ${errorText}`);
    }

    const apifyResults = await datasetResponse.json();
    console.log('Transcript extraction completed, processing results...');
    
    // Log the complete response for debugging
    console.log('Full Apify response:', JSON.stringify(apifyResults, null, 2));

    if (!Array.isArray(apifyResults) || apifyResults.length === 0) {
      throw new Error('No transcript results returned from Apify actor');
    }

    // Process the first result with comprehensive field checking
    const result = apifyResults[0];
    console.log('Processing result structure:', JSON.stringify(result, null, 2));
    
    // Try multiple possible transcript field names and formats
    let rawTranscript = null;
    
    // Check for various transcript field names
    const transcriptFields = [
      'plain', // Primary field used by matthewjames~youtube-transcript-scraper-and-formatter
      'transcript', 
      'text', 
      'fullTranscript', 
      'transcription',
      'content',
      'subtitles',
      'captions'
    ];
    
    for (const field of transcriptFields) {
      if (result[field]) {
        rawTranscript = result[field];
        console.log(`Found transcript in field: ${field}`);
        break;
      }
    }
    
    // If no direct field, check nested structures
    if (!rawTranscript && result.data) {
      console.log('Checking nested data structure...');
      for (const field of transcriptFields) {
        if (result.data[field]) {
          rawTranscript = result.data[field];
          console.log(`Found transcript in data.${field}`);
          break;
        }
      }
    }
    
    // Handle array of transcript segments
    if (!rawTranscript && result.segments && Array.isArray(result.segments)) {
      console.log('Found transcript segments, combining...');
      rawTranscript = result.segments
        .map(segment => segment.text || segment.content || segment.transcript)
        .filter(Boolean)
        .join(' ');
    }
    
    // Handle structured transcript with timestamps
    if (!rawTranscript && result.transcriptSegments && Array.isArray(result.transcriptSegments)) {
      console.log('Found transcript segments with timestamps, combining...');
      rawTranscript = result.transcriptSegments
        .map(segment => segment.text || segment.content)
        .filter(Boolean)
        .join(' ');
    }
    
    if (!rawTranscript || rawTranscript.trim().length === 0) {
      console.error('Available fields in result:', Object.keys(result));
      throw new Error(`No transcript text found in any expected fields. Available fields: ${Object.keys(result).join(', ')}`);
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