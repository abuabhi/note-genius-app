
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

    console.log('Starting enhanced YouTube transcription pipeline for:', youtubeUrl);

    // Step 1: Check video accessibility first
    console.log('Step 1: Checking video accessibility...');
    try {
      const checkResponse = await fetch(`${cloudRunServiceUrl}/check-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl })
      });

      const checkData = await checkResponse.json();
      if (!checkData.accessible) {
        throw new Error(`Video is not accessible: ${checkData.error}`);
      }
      console.log('Video accessibility confirmed');
    } catch (error) {
      console.warn('Video accessibility check failed, proceeding anyway:', error.message);
    }

    // Step 2: Extract audio using enhanced Cloud Run service
    console.log('Step 2: Extracting audio via enhanced Cloud Run...');
    const audioExtractionResponse = await fetch(`${cloudRunServiceUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ youtubeUrl })
    });

    if (!audioExtractionResponse.ok) {
      const errorData = await audioExtractionResponse.json();
      
      // Enhanced error handling based on error type
      let userFriendlyMessage = 'Audio extraction failed';
      
      switch (errorData.errorType) {
        case 'bot_detection':
          userFriendlyMessage = 'YouTube is blocking access to this video. Try using a different video or upload the audio file directly.';
          break;
        case 'unavailable':
          userFriendlyMessage = 'This video is unavailable. It may be private, deleted, or region-restricted.';
          break;
        case 'timeout':
          userFriendlyMessage = 'Video processing timed out. Please try a shorter video.';
          break;
        case 'extraction_failed':
          userFriendlyMessage = 'Unable to extract audio from this video. YouTube may have restrictions on this content.';
          break;
        default:
          userFriendlyMessage = errorData.error || 'Audio extraction failed';
      }
      
      throw new Error(userFriendlyMessage);
    }

    const { audioUrl, videoInfo, cloudFileName, requestId } = await audioExtractionResponse.json();
    console.log(`Audio extracted successfully. Request ID: ${requestId}`);

    // Step 3: Upload audio to AssemblyAI with retry logic
    console.log('Step 3: Uploading audio to AssemblyAI...');
    let uploadUrl;
    let uploadAttempts = 0;
    const maxUploadAttempts = 3;

    while (uploadAttempts < maxUploadAttempts) {
      try {
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
        }

        const audioArrayBuffer = await audioResponse.arrayBuffer();
        
        const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
          method: 'POST',
          headers: {
            'Authorization': assemblyAIKey,
          },
          body: audioArrayBuffer
        });

        if (!uploadResponse.ok) {
          throw new Error(`AssemblyAI upload failed: ${uploadResponse.statusText}`);
        }

        const uploadData = await uploadResponse.json();
        uploadUrl = uploadData.upload_url;
        break;
      } catch (error) {
        uploadAttempts++;
        console.log(`Upload attempt ${uploadAttempts} failed:`, error.message);
        
        if (uploadAttempts >= maxUploadAttempts) {
          throw new Error(`Failed to upload audio after ${maxUploadAttempts} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('Audio uploaded to AssemblyAI successfully');

    // Step 4: Start transcription with enhanced options
    console.log('Step 4: Starting enhanced transcription...');
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: uploadUrl,
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
        format_text: true,
        disfluencies: false,
        dual_channel: false
      }),
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      throw new Error(`Failed to start transcription: ${errorText}`);
    }

    const { id: transcriptId } = await transcriptionResponse.json();
    console.log(`Transcription started with ID: ${transcriptId}`);

    // Step 5: Poll for completion with enhanced error handling
    console.log('Step 5: Polling for transcription completion...');
    const transcriptData = await pollTranscriptionWithRetry(transcriptId);
    
    // Step 6: Cleanup temporary files (fire and forget)
    cleanupTempFile(cloudFileName).catch(error => 
      console.warn('Failed to cleanup temp file:', error)
    );

    console.log('Enhanced transcription pipeline completed successfully');
    
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
      wordCount: transcriptData.words?.length || 0,
      extractionMethod: 'enhanced_fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced YouTube transcription pipeline error:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    let errorType = 'unknown';
    
    if (error.message.includes('YouTube is blocking')) {
      errorType = 'blocked';
      userMessage = 'YouTube is blocking access to this video. This often happens with popular videos, age-restricted content, or due to geographic restrictions. Try a different video or upload the audio file directly.';
    } else if (error.message.includes('Video is not accessible')) {
      errorType = 'inaccessible';
      userMessage = 'This video cannot be accessed. It may be private, deleted, or have viewing restrictions.';
    } else if (error.message.includes('Audio extraction failed')) {
      errorType = 'extraction_failed';
      userMessage = 'Unable to extract audio from this video. This can happen with certain video types or due to YouTube restrictions.';
    } else if (error.message.includes('AssemblyAI')) {
      errorType = 'transcription_failed';
      userMessage = 'Audio extraction succeeded, but transcription failed. Please try again or contact support if the issue persists.';
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: userMessage,
      errorType,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        suggestions: [
          'Try a different YouTube video',
          'Ensure the video is public and not age-restricted',
          'Check if the video is available in your region',
          'Consider uploading audio files directly instead'
        ]
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function pollTranscriptionWithRetry(transcriptId: string): Promise<any> {
  let attempts = 0;
  const maxAttempts = 150; // 12.5 minutes max (5 second intervals)
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
        console.log(`Transcription completed after ${attempts + 1} attempts`);
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
  
  throw new Error('Transcription timeout - processing took longer than expected. Please try a shorter video.');
}

async function cleanupTempFile(cloudFileName: string): Promise<void> {
  try {
    const fileName = cloudFileName.split('/').pop();
    const cleanupResponse = await fetch(`${cloudRunServiceUrl}/cleanup/${fileName}`, {
      method: 'DELETE'
    });
    
    if (cleanupResponse.ok) {
      console.log('Temporary file cleaned up successfully');
    } else {
      console.warn('Cleanup response not ok:', cleanupResponse.status);
    }
  } catch (error) {
    console.error('Failed to cleanup temporary file:', error);
  }
}
