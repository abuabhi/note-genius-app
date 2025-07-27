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
    console.log('🔍 Function started, checking environment variables...');
    console.log('SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
    console.log('GLADIA_API_KEY:', gladiaApiKey ? 'present' : 'missing');

    const requestBody = await req.json();
    console.log('📥 Request body:', requestBody);
    
    const { youtubeUrl } = requestBody;
    
    if (!youtubeUrl) {
      console.error('❌ YouTube URL is missing');
      throw new Error('YouTube URL is required');
    }

    console.log('🎬 Starting Gladia.io YouTube transcription for:', youtubeUrl);

    // Download audio using yt-dlp
    console.log('📥 Downloading audio from YouTube...');
    const audioPath = "/tmp/audio.mp3";

    const ytDlpProcess = new Deno.Command("/usr/bin/yt-dlp", {
      args: [
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        audioPath,
        youtubeUrl.trim(),
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await ytDlpProcess.output();

    if (code !== 0) {
      const stderrText = new TextDecoder().decode(stderr);
      console.error('❌ yt-dlp failed:', stderrText);
      throw new Error(`Failed to download audio: ${stderrText}`);
    }

    console.log('✅ Audio downloaded successfully');

    // Read the downloaded audio file
    const audioData = await Deno.readFile(audioPath);
    console.log('📄 Audio file size:', audioData.length, 'bytes');

    // Call Gladia.io API for transcription with audio file
    console.log('📤 Sending audio to Gladia.io API...');
    const formData = new FormData();
    formData.append("audio", new Blob([audioData], { type: "audio/mpeg" }), "audio.mp3");

    const gladiaResponse = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gladiaApiKey}`,
      },
      body: formData
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
    const transcript = gladiaData.prediction || gladiaData.transcription || gladiaData.text || '';
    const videoTitle = gladiaData.metadata?.title || 'YouTube Video';
    const videoMetadata = {
      title: videoTitle,
      duration: gladiaData.metadata?.duration,
      language: gladiaData.language,
      confidence: gladiaData.confidence
    };

    // Clean up the temporary file
    try {
      await Deno.remove(audioPath);
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

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