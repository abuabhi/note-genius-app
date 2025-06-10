
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const youtubeApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
const assemblyAIApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');

interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  channelTitle: string;
}

interface TranscriptionProgress {
  status: 'processing' | 'completed' | 'error';
  progress?: number;
  method?: 'captions' | 'assemblyai';
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, videoId, url, metadata } = await req.json();

    if (action === 'get_metadata') {
      const videoMetadata = await getVideoMetadata(videoId);
      return new Response(JSON.stringify({ metadata: videoMetadata }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'check_captions') {
      const hasCaption = await checkCaptionsAvailability(videoId);
      return new Response(JSON.stringify({ 
        hasCaption,
        transcriptionMethod: hasCaption ? 'captions' : 'assemblyai'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'transcribe') {
      console.log(`Starting transcription for video: ${videoId}`);
      const transcript = await transcribeVideo(videoId, url);
      const enhancedContent = await enhanceTranscript(transcript, metadata);
      
      return new Response(JSON.stringify(enhancedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('YouTube transcribe error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process video' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  if (!youtubeApiKey) {
    throw new Error('YouTube API key not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch video metadata');
  }

  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  const snippet = video.snippet;
  const contentDetails = video.contentDetails;

  return {
    title: snippet.title,
    description: snippet.description,
    duration: formatDuration(contentDetails.duration),
    thumbnailUrl: snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
    channelTitle: snippet.channelTitle,
  };
}

async function checkCaptionsAvailability(videoId: string): Promise<boolean> {
  if (!youtubeApiKey) {
    console.log('YouTube API key not available for caption check');
    return false;
  }

  try {
    console.log(`Checking captions availability for video: ${videoId}`);
    
    // Get caption tracks
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${youtubeApiKey}`
    );

    if (!captionsResponse.ok) {
      console.log('Failed to check captions:', captionsResponse.status);
      return false;
    }

    const captionsData = await captionsResponse.json();
    
    if (!captionsData.items || captionsData.items.length === 0) {
      console.log('No caption tracks found');
      return false;
    }

    // Check if there are any caption tracks (auto-generated or manual)
    const hasValidCaptions = captionsData.items.some((item: any) => {
      const snippet = item.snippet;
      return snippet && (snippet.trackKind === 'standard' || snippet.trackKind === 'ASR');
    });

    console.log(`Captions available: ${hasValidCaptions}`);
    return hasValidCaptions;
    
  } catch (error) {
    console.error('Error checking captions availability:', error);
    return false;
  }
}

async function transcribeVideo(videoId: string, videoUrl: string): Promise<string> {
  try {
    console.log(`Starting transcription workflow for video: ${videoId}`);
    
    // Step 1: Check for existing captions
    const hasCaption = await checkCaptionsAvailability(videoId);
    
    if (hasCaption) {
      console.log('Attempting to get existing captions...');
      const captions = await getYouTubeCaptions(videoId);
      if (captions && captions.length > 50) { // Ensure we have substantial content
        console.log('Successfully retrieved captions');
        return captions;
      }
    }

    // Step 2: Use Assembly AI as fallback
    console.log('No captions available, using Assembly AI for transcription...');
    
    if (!assemblyAIApiKey) {
      throw new Error('Assembly AI API key not configured');
    }

    const transcript = await transcribeWithAssemblyAI(videoUrl);
    
    if (!transcript || transcript.length < 20) {
      throw new Error('Assembly AI transcription failed or returned insufficient content');
    }

    console.log('Successfully transcribed with Assembly AI');
    return transcript;

  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

async function getYouTubeCaptions(videoId: string): Promise<string | null> {
  // Note: This is a simplified implementation
  // In a full implementation, you would need OAuth2 to download actual caption content
  // For now, we return null to trigger Assembly AI fallback
  console.log('Caption download requires OAuth2 implementation - falling back to Assembly AI');
  return null;
}

async function transcribeWithAssemblyAI(videoUrl: string): Promise<string> {
  try {
    console.log('Starting Assembly AI transcription for:', videoUrl);

    // Step 1: Submit transcription job
    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        speaker_labels: false, // Disable speaker diarization for speed
        auto_highlights: false,
        sentiment_analysis: false,
        entity_detection: false,
        language_detection: true,
      }),
    });

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      throw new Error(`Assembly AI submission failed: ${errorData.error || submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const transcriptId = submitData.id;
    
    console.log(`Assembly AI job submitted with ID: ${transcriptId}`);

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max (5 second intervals)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': assemblyAIApiKey,
        },
      });

      if (!pollResponse.ok) {
        throw new Error('Failed to check transcription status');
      }

      const pollData = await pollResponse.json();
      console.log(`Assembly AI status: ${pollData.status}`);

      if (pollData.status === 'completed') {
        if (!pollData.text) {
          throw new Error('Assembly AI completed but returned no text');
        }
        console.log(`Assembly AI transcription completed. Length: ${pollData.text.length} characters`);
        return pollData.text;
      } else if (pollData.status === 'error') {
        throw new Error(`Assembly AI transcription failed: ${pollData.error}`);
      }

      attempts++;
    }

    throw new Error('Assembly AI transcription timed out');

  } catch (error) {
    console.error('Assembly AI transcription error:', error);
    throw error;
  }
}

async function enhanceTranscript(transcript: string, metadata: VideoMetadata) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Check if we have a valid transcript
  if (!transcript || transcript.length < 50) {
    console.log('No valid transcript available, creating content from metadata');
    
    const prompt = `
Create a structured note based on this YouTube video information:

Title: ${metadata.title}
Channel: ${metadata.channelTitle}
Duration: ${metadata.duration}
Description: ${metadata.description.substring(0, 500)}...

Since transcription was not available, please create a helpful note that includes:
1. A summary based on the title and description
2. Key topics that would likely be covered
3. Potential learning objectives
4. A note that full transcription was not available

Format your response as JSON with these fields:
- title: string (a descriptive title for the note)
- description: string (brief summary)
- subject: string (main category like Science, Technology, etc.)
- content: string (markdown formatted content with the above elements)
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates structured notes from video information.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content from metadata');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      title: result.title,
      description: result.description,
      subject: result.subject,
      content: result.content,
      subject_id: null,
      transcriptionMethod: 'metadata_only'
    };
  }

  // Process the actual transcript
  console.log(`Processing transcript of ${transcript.length} characters`);
  
  const prompt = `
You are tasked with analyzing a YouTube video transcript and creating a well-structured note. Here's the video information:

Title: ${metadata.title}
Channel: ${metadata.channelTitle}
Description: ${metadata.description.substring(0, 500)}...

Transcript: ${transcript}

Please provide:
1. A concise, descriptive title for the note (different from the video title if needed)
2. A brief description/summary
3. The main subject category (e.g., Science, Technology, History, etc.)
4. Well-formatted content with key points, important concepts, and main takeaways

Format your response as JSON with these fields:
- title: string
- description: string  
- subject: string
- content: string (markdown formatted)
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that analyzes video content and creates structured notes.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to enhance transcript');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return {
    title: result.title,
    description: result.description,
    subject: result.subject,
    content: result.content,
    subject_id: null,
    transcriptionMethod: 'assemblyai'
  };
}

function formatDuration(duration: string): string {
  // Convert ISO 8601 duration to readable format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
