import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudyTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  youtubeUrl: string;
  thumbnailUrl: string;
  tags: string[];
  category: string;
}

// Curated YouTube Study Music Library
const CURATED_YOUTUBE_TRACKS: StudyTrack[] = [
  {
    id: 'lofi-1',
    name: 'Lofi Hip Hop Study Mix',
    artist: 'ChillHop Music',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    tags: ['lofi', 'hip-hop', 'chill', 'focus'],
    category: 'lofi'
  },
  {
    id: 'ambient-1',
    name: 'Deep Focus Music',
    artist: 'Ambient Worlds',
    duration: 7200,
    youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg',
    tags: ['ambient', 'focus', 'concentration', 'deep'],
    category: 'ambient'
  },
  {
    id: 'classical-1',
    name: 'Classical Music for Studying',
    artist: 'Halidon Music',
    duration: 5400,
    youtubeUrl: 'https://www.youtube.com/watch?v=YJKjHeGaKJQ',
    thumbnailUrl: 'https://img.youtube.com/vi/YJKjHeGaKJQ/maxresdefault.jpg',
    tags: ['classical', 'piano', 'study', 'focus'],
    category: 'classical'
  },
  {
    id: 'nature-1',
    name: 'Rain Sounds for Studying',
    artist: 'Nature Sounds',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=q76bMs-NwRk',
    thumbnailUrl: 'https://img.youtube.com/vi/q76bMs-NwRk/maxresdefault.jpg',
    tags: ['rain', 'nature', 'white-noise', 'focus'],
    category: 'nature'
  },
  {
    id: 'jazz-1',
    name: 'Smooth Jazz for Work',
    artist: 'Smooth Jazz Music',
    duration: 4800,
    youtubeUrl: 'https://www.youtube.com/watch?v=neV3EPgvZ3g',
    thumbnailUrl: 'https://img.youtube.com/vi/neV3EPgvZ3g/maxresdefault.jpg',
    tags: ['jazz', 'smooth', 'work', 'concentration'],
    category: 'jazz'
  },
  {
    id: 'lofi-2',
    name: 'Calm Lofi Study Beats',
    artist: 'Lofi Girl',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    thumbnailUrl: 'https://img.youtube.com/vi/DWcJFNfaw9c/maxresdefault.jpg',
    tags: ['lofi', 'calm', 'study', 'beats'],
    category: 'lofi'
  },
  {
    id: 'piano-1',
    name: 'Peaceful Piano Music',
    artist: 'Piano Relaxing Music',
    duration: 4800,
    youtubeUrl: 'https://www.youtube.com/watch?v=EFkaFaYN7rM',
    thumbnailUrl: 'https://img.youtube.com/vi/EFkaFaYN7rM/maxresdefault.jpg',
    tags: ['piano', 'peaceful', 'relaxing', 'study'],
    category: 'classical'
  },
  {
    id: 'ambient-2',
    name: 'Space Ambient Music',
    artist: 'Iron Cthulhu Apocalypse',
    duration: 7200,
    youtubeUrl: 'https://www.youtube.com/watch?v=U_T4CCMOUg0',
    thumbnailUrl: 'https://img.youtube.com/vi/U_T4CCMOUg0/maxresdefault.jpg',
    tags: ['ambient', 'space', 'atmospheric', 'focus'],
    category: 'ambient'
  },
  {
    id: 'nature-2',
    name: 'Forest Sounds',
    artist: 'Relaxing White Noise',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=UbX-WNo0wZg',
    thumbnailUrl: 'https://img.youtube.com/vi/UbX-WNo0wZg/maxresdefault.jpg',
    tags: ['forest', 'nature', 'birds', 'peaceful'],
    category: 'nature'
  },
  {
    id: 'electronic-1',
    name: 'Synthwave Study Mix',
    artist: 'The 80s Guy',
    duration: 4800,
    youtubeUrl: 'https://www.youtube.com/watch?v=4bKL8ZO8w90',
    thumbnailUrl: 'https://img.youtube.com/vi/4bKL8ZO8w90/maxresdefault.jpg',
    tags: ['synthwave', 'electronic', 'retro', 'study'],
    category: 'electronic'
  },
  {
    id: 'lofi-3',
    name: 'Cozy Lofi Coffee Shop',
    artist: 'Coffee Shop Music',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=bmVKaAV_7-A',
    thumbnailUrl: 'https://img.youtube.com/vi/bmVKaAV_7-A/maxresdefault.jpg',
    tags: ['lofi', 'coffee', 'cozy', 'chill'],
    category: 'lofi'
  },
  {
    id: 'classical-2',
    name: 'Baroque Music for Study',
    artist: 'Classical Music',
    duration: 5400,
    youtubeUrl: 'https://www.youtube.com/watch?v=7pVAXXCiAII',
    thumbnailUrl: 'https://img.youtube.com/vi/7pVAXXCiAII/maxresdefault.jpg',
    tags: ['baroque', 'classical', 'study', 'concentration'],
    category: 'classical'
  },
  {
    id: 'meditation-1',
    name: 'Tibetan Singing Bowls',
    artist: 'Meditation Music',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=2Eos3F8B5c8',
    thumbnailUrl: 'https://img.youtube.com/vi/2Eos3F8B5c8/maxresdefault.jpg',
    tags: ['meditation', 'tibetan', 'healing', 'focus'],
    category: 'meditation'
  },
  {
    id: 'binaural-1',
    name: 'Alpha Waves 8-14 Hz',
    artist: 'Binaural Beats Base',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=WPni755-Krg',
    thumbnailUrl: 'https://img.youtube.com/vi/WPni755-Krg/maxresdefault.jpg',
    tags: ['binaural', 'alpha-waves', 'focus', 'concentration'],
    category: 'binaural'
  },
  {
    id: 'ambient-3',
    name: 'Dark Ambient Study',
    artist: 'Cryo Chamber',
    duration: 5400,
    youtubeUrl: 'https://www.youtube.com/watch?v=l4GY9QJ9iKI',
    thumbnailUrl: 'https://img.youtube.com/vi/l4GY9QJ9iKI/maxresdefault.jpg',
    tags: ['dark-ambient', 'atmospheric', 'study', 'focus'],
    category: 'ambient'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { category = 'all', limit = 15, userId = null, autoAssign = false } = await req.json().catch(() => ({}));

    // Get available tracks (filter by category if specified)
    let availableTracks = CURATED_YOUTUBE_TRACKS;
    if (category && category !== 'all') {
      availableTracks = CURATED_YOUTUBE_TRACKS.filter(track => track.category === category);
    }

    // If autoAssign is true and userId provided, auto-assign 3 random tracks
    if (autoAssign && userId) {
      console.log('Auto-assigning 3 random tracks for user:', userId);
      
      // Get 3 random tracks from different categories for variety
      const categories = ['lofi', 'ambient', 'classical', 'nature'];
      const selectedTracks: string[] = [];
      
      for (const cat of categories) {
        const categoryTracks = CURATED_YOUTUBE_TRACKS.filter(t => t.category === cat);
        if (categoryTracks.length > 0 && selectedTracks.length < 3) {
          const randomTrack = categoryTracks[Math.floor(Math.random() * categoryTracks.length)];
          selectedTracks.push(randomTrack.id);
        }
      }
      
      // If we still need more tracks, add random ones
      while (selectedTracks.length < 3) {
        const remainingTracks = CURATED_YOUTUBE_TRACKS.filter(t => !selectedTracks.includes(t.id));
        if (remainingTracks.length === 0) break;
        const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        selectedTracks.push(randomTrack.id);
      }

      // Save to user preferences
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            study_music_preferences: { selectedTracks },
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user preferences:', updateError);
        } else {
          console.log('Successfully assigned default tracks:', selectedTracks);
        }
      } catch (err) {
        console.error('Error in auto-assign:', err);
      }
    }

    // Shuffle tracks for variety
    const shuffledTracks = [...availableTracks].sort(() => Math.random() - 0.5);

    return new Response(JSON.stringify({ 
      tracks: shuffledTracks.slice(0, limit),
      total: shuffledTracks.length,
      source: 'youtube-curated',
      availableCategories: ['all', 'lofi', 'ambient', 'classical', 'nature', 'jazz', 'electronic', 'meditation', 'binaural']
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