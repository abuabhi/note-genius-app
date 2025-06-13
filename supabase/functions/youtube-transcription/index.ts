
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const assemblyAIKey = Deno.env.get('ASSEMBLYAI_API_KEY')!;
const cloudRunServiceUrl = Deno.env.get('CLOUD_RUN_SERVICE_URL')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl } = await req.json();
    
    if (!youtubeUrl) {
      throw new Error('YouTube URL is required');
    }

    console.log('Starting YouTube transcription pipeline for:', youtubeUrl);

    // Step 1: Extract audio using Cloud Run service
    console.log('Step 1: Extracting audio via Cloud Run...');
    const audioExtractionResponse = await fetch(`${cloudRunServiceUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ youtubeUrl })
    });

    if (!audioExtractionResponse.ok) {
      const errorData = await audioExtractionResponse.text();
      throw new Error(`Audio extraction failed: ${errorData}`);
    }

    const { audioUrl, videoInfo, cloudFileName, requestId } = await audioExtractionResponse.json();
    console.log(`Audio extracted successfully. Request ID: ${requestId}`);

    // Step 2: Upload audio to AssemblyAI
    console.log('Step 2: Uploading audio to AssemblyAI...');
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIKey,
      },
      body: await fetch(audioUrl).then(r => r.arrayBuffer())
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI');
    }

    const { upload_url } = await uploadResponse.json();
    console.log('Audio uploaded to AssemblyAI successfully');

    // Step 3: Start transcription with enhanced options
    console.log('Step 3: Starting transcription...');
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        auto_chapters: true,
        summarization: true,
        summary_type: 'bullets',
        summary_model: 'informative',
        speaker_labels: true,
        auto_highlights: true,
        entity_detection: true,
        sentiment_analysis: true,
        language_detection: true,
        punctuate: true,
        format_text: true
      }),
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Failed to start transcription');
    }

    const { id: transcriptId } = await transcriptionResponse.json();
    console.log(`Transcription started with ID: ${transcriptId}`);

    // Step 4: Poll for completion with enhanced error handling
    console.log('Step 4: Polling for transcription completion...');
    const transcriptData = await pollTranscriptionWithRetry(transcriptId);
    
    // Step 5: Cleanup temporary files (fire and forget)
    cleanupTempFile(cloudFileName).catch(error => 
      console.warn('Failed to cleanup temp file:', error)
    );

    console.log('Transcription pipeline completed successfully');
    
    return new Response(JSON.stringify({
      success: true,
      requestId,
      videoTitle: videoInfo.title,
      videoDuration: videoInfo.duration,
      videoUploader: videoInfo.uploader,
      transcript: transcriptData.text,
      summary: transcriptData.summary,
      chapters: transcriptData.chapters || [],
      highlights: transcriptData.auto_highlights_result?.results || [],
      speakers: transcriptData.utterances || [],
      entities: transcriptData.entities || [],
      sentiment: transcriptData.sentiment_analysis_results || [],
      confidence: transcriptData.confidence,
      languageDetected: transcriptData.language_code,
      processingTime: transcriptData.audio_duration,
      wordCount: transcriptData.words?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('YouTube transcription pipeline error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function pollTranscriptionWithRetry(transcriptId: string): Promise<any> {
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes max (5 second intervals)
  const retryDelay = 5000; // 5 seconds
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': assemblyAIKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check transcription status: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'completed') {
        return data;
      } else if (data.status === 'error') {
        throw new Error(`Transcription failed: ${data.error}`);
      }
      
      console.log(`Transcription status: ${data.status}, attempt ${attempts + 1}/${maxAttempts}`);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      attempts++;
      
    } catch (error) {
      console.error(`Polling attempt ${attempts + 1} failed:`, error);
      
      // If it's a network error, retry after a longer delay
      if (attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * 2));
        attempts++;
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Transcription timeout - processing took longer than expected');
}

async function cleanupTempFile(cloudFileName: string): Promise<void> {
  try {
    const fileName = cloudFileName.split('/').pop();
    await fetch(`${cloudRunServiceUrl}/cleanup/${fileName}`, {
      method: 'DELETE'
    });
    console.log('Temporary file cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup temporary file:', error);
  }
}
