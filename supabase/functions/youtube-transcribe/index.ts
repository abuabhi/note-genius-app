
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
    // First, try to get existing captions
    const captions = await getYouTubeCaptions(videoId);
    if (captions) {
      return captions;
    }

    // If no captions available, we would need to use audio extraction
    // For now, return a message indicating manual transcription is needed
    throw new Error('This video does not have available captions. Manual transcription would be required.');
    
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

async function enhanceTranscript(transcript: string, metadata: VideoMetadata) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
    subject_id: null // Will be set by the frontend based on subject mapping
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
