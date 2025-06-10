
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const youtubeApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');

interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  channelTitle: string;
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

    if (action === 'transcribe') {
      console.log(`Starting transcription for video: ${videoId}`);
      const transcript = await transcribeVideo(videoId);
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

async function transcribeVideo(videoId: string): Promise<string> {
  try {
    console.log(`Attempting to get captions for video: ${videoId}`);
    
    // First, try to get existing captions
    const captions = await getYouTubeCaptions(videoId);
    if (captions) {
      console.log('Found existing captions');
      return captions;
    }

    console.log('No captions found, attempting audio extraction and transcription');
    
    // If no captions available, try to get audio and transcribe with Whisper
    const audioTranscript = await transcribeAudioWithWhisper(videoId);
    if (audioTranscript) {
      return audioTranscript;
    }

    // If both methods fail, return a helpful error message
    throw new Error('Unable to transcribe this video. The video may not have captions available and audio transcription failed. Please try a different video or one with captions.');
    
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

async function getYouTubeCaptions(videoId: string): Promise<string | null> {
  if (!youtubeApiKey) {
    return null;
  }

  try {
    // Get caption tracks
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${youtubeApiKey}`
    );

    if (!captionsResponse.ok) {
      return null;
    }

    const captionsData = await captionsResponse.json();
    
    if (!captionsData.items || captionsData.items.length === 0) {
      return null;
    }

    // Find English captions or the first available
    const englishCaption = captionsData.items.find((item: any) => 
      item.snippet.language === 'en' || item.snippet.language === 'en-US'
    ) || captionsData.items[0];

    // Note: Downloading actual caption content requires OAuth2
    // For this implementation, we'll return a placeholder
    return null;
    
  } catch (error) {
    console.error('Error fetching captions:', error);
    return null;
  }
}

async function transcribeAudioWithWhisper(videoId: string): Promise<string | null> {
  if (!openAIApiKey) {
    console.log('OpenAI API key not available for Whisper transcription');
    return null;
  }

  try {
    console.log(`Attempting to transcribe audio for video: ${videoId}`);
    
    // For now, we'll return a helpful message since direct audio extraction
    // from YouTube requires additional infrastructure and may violate ToS
    // This is a placeholder for when proper audio extraction is implemented
    
    throw new Error('Audio transcription is not yet implemented. Please use videos with existing captions.');
    
  } catch (error) {
    console.error('Whisper transcription error:', error);
    return null;
  }
}

async function enhanceTranscript(transcript: string, metadata: VideoMetadata) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // If transcript is empty or very short, create content from metadata
  if (!transcript || transcript.length < 50) {
    console.log('No transcript available, creating content from metadata');
    
    const prompt = `
Create a structured note based on this YouTube video information:

Title: ${metadata.title}
Channel: ${metadata.channelTitle}
Duration: ${metadata.duration}
Description: ${metadata.description.substring(0, 500)}...

Since no transcript is available, please create a helpful note that includes:
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
      subject_id: null
    };
  }

  // Original transcript enhancement logic
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
4. Well-formatted content with key points, timestamps if relevant, and main takeaways

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
    subject_id: null
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
