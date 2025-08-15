import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudyTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  previewUrl: string;
  tags: string[];
  webformatURL: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pixabayApiKey = Deno.env.get('PIXABAY_API_KEY');
    if (!pixabayApiKey) {
      throw new Error('Pixabay API key not configured');
    }

    const { category = 'music', limit = 15 } = await req.json().catch(() => ({}));

    // Search for study music tracks using Pixabay Music API
    const searchTerms = [
      'lo-fi study music', 'ambient study', 'focus music', 'concentration music',
      'peaceful piano', 'background music', 'meditation music', 'relaxing instrumental'
    ];
    
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const response = await fetch(
      `https://pixabay.com/api/music/?key=${pixabayApiKey}&q=${encodeURIComponent(searchTerm)}&per_page=${limit}&category=music&music_type=instrumental&audio_type=all`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Pixabay data to our StudyTrack format
    const tracks: StudyTrack[] = data.hits?.map((track: any) => ({
      id: track.id.toString(),
      name: track.tags.split(',')[0]?.trim() || 'Study Music',
      artist: track.user || 'Unknown Artist',
      duration: track.duration || 180, // Default 3 minutes if not provided
      previewUrl: track.previewURL || track.webformatURL,
      tags: track.tags.split(',').map((tag: string) => tag.trim()),
      webformatURL: track.webformatURL
    })) || [];

    // If no results from Pixabay, return curated study music list
    const fallbackTracks: StudyTrack[] = [
      {
        id: 'lofi-1',
        name: 'Peaceful Study',
        artist: 'Study Sounds',
        duration: 240,
        previewUrl: '',
        tags: ['lo-fi', 'calm', 'focus'],
        webformatURL: ''
      },
      {
        id: 'ambient-1',
        name: 'Forest Ambience',
        artist: 'Nature Sounds',
        duration: 300,
        previewUrl: '',
        tags: ['ambient', 'nature', 'relaxing'],
        webformatURL: ''
      },
      {
        id: 'piano-1',
        name: 'Gentle Piano',
        artist: 'Instrumental',
        duration: 180,
        previewUrl: '',
        tags: ['piano', 'classical', 'peaceful'],
        webformatURL: ''
      },
      {
        id: 'rain-1',
        name: 'Rain Sounds',
        artist: 'Weather Sounds',
        duration: 600,
        previewUrl: '',
        tags: ['rain', 'white-noise', 'focus'],
        webformatURL: ''
      },
      {
        id: 'binaural-1',
        name: 'Alpha Waves',
        artist: 'Binaural Beats',
        duration: 1800,
        previewUrl: '',
        tags: ['binaural', 'concentration', 'alpha'],
        webformatURL: ''
      }
    ];

    const finalTracks = tracks.length > 0 ? tracks : fallbackTracks;

    return new Response(JSON.stringify({ 
      tracks: finalTracks.slice(0, limit),
      total: finalTracks.length,
      source: tracks.length > 0 ? 'pixabay' : 'fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-study-music function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      tracks: [],
      total: 0,
      source: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});