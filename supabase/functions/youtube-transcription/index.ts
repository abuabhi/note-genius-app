
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl } = await req.json();
    
    if (!youtubeUrl) {
      throw new Error('YouTube URL is required');
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    console.log('Processing YouTube video:', videoId);

    // Get video info using a public API
    const videoInfo = await getVideoInfo(videoId);
    
    // Get audio stream URL using a more reliable method
    const audioUrl = await getAudioStreamUrl(videoId);
    
    console.log('Uploading audio to AssemblyAI...');
    
    // Upload audio to AssemblyAI
    const uploadUrl = await uploadToAssemblyAI(audioUrl);
    
    console.log('Starting transcription...');
    
    // Start transcription
    const transcriptId = await startTranscription(uploadUrl);
    
    console.log('Polling for transcription completion...');
    
    // Poll for completion
    const transcriptData = await pollTranscription(transcriptId);
    
    console.log('Transcription completed successfully');
    
    return new Response(JSON.stringify({
      success: true,
      videoTitle: videoInfo.title,
      transcript: transcriptData.text,
      summary: transcriptData.summary,
      chapters: transcriptData.chapters || [],
      confidence: transcriptData.confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('YouTube transcription error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function getVideoInfo(videoId: string) {
  // Using YouTube's oEmbed endpoint which is more reliable
  const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
  
  if (!response.ok) {
    throw new Error('Failed to get video information');
  }
  
  const data = await response.json();
  return {
    title: data.title || `YouTube Video ${videoId}`,
    duration: data.duration || 0
  };
}

async function getAudioStreamUrl(videoId: string): Promise<string> {
  // Using a different approach - we'll use yt-dlp via a public API
  // This is a fallback that should work more reliably
  
  try {
    // Try the first service
    const response1 = await fetch('https://api.vevioz.com/api/button/mp3/128', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`
      })
    });

    if (response1.ok) {
      const data = await response1.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (error) {
    console.error('First service failed:', error);
  }

  try {
    // Try second service as fallback
    const response2 = await fetch('https://api.savemp3.cc/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        quality: 'mp3'
      })
    });

    if (response2.ok) {
      const data = await response2.json();
      if (data.status === 'success' && data.download_url) {
        return data.download_url;
      }
    }
  } catch (error) {
    console.error('Second service failed:', error);
  }

  // If both services fail, try a simpler approach
  try {
    // Use a direct YouTube audio extraction service
    const response3 = await fetch(`https://api.youtubemultidownloader.net/watch?v=${videoId}`);
    
    if (response3.ok) {
      const data = await response3.json();
      const audioFormats = data.formats?.filter((f: any) => f.acodec && f.acodec !== 'none');
      
      if (audioFormats && audioFormats.length > 0) {
        // Get the best audio quality available
        const bestAudio = audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
        return bestAudio.url;
      }
    }
  } catch (error) {
    console.error('Third service failed:', error);
  }

  throw new Error('Could not extract audio from YouTube video. Please try again later or use a different video.');
}

async function uploadToAssemblyAI(audioUrl: string): Promise<string> {
  // Download the audio first
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error('Failed to download audio');
  }
  
  const audioBuffer = await audioResponse.arrayBuffer();
  
  // Upload to AssemblyAI
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': assemblyAIKey,
      'Content-Type': 'application/octet-stream',
    },
    body: audioBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload audio to AssemblyAI');
  }

  const uploadData = await uploadResponse.json();
  return uploadData.upload_url;
}

async function startTranscription(uploadUrl: string): Promise<string> {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
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
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start transcription');
  }

  const data = await response.json();
  return data.id;
}

async function pollTranscription(transcriptId: string): Promise<any> {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max (5 second intervals)
  
  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': assemblyAIKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check transcription status');
    }

    const data = await response.json();
    
    if (data.status === 'completed') {
      return data;
    } else if (data.status === 'error') {
      throw new Error(`Transcription failed: ${data.error}`);
    }
    
    // Wait 5 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }
  
  throw new Error('Transcription timeout - please try again');
}
