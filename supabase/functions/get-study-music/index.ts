import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // Parse request body for filters
    const { category = 'all', limit = 20 } = await req.json().catch(() => ({}));

    console.log('🎵 get-study-music: Starting query for category:', category, 'limit:', limit);

    // Query study music tracks from database
    let query = supabase
      .from('study_music_tracks')
      .select('*')
      .eq('is_active', true);

    console.log('🎵 get-study-music: Querying study_music_tracks with is_active = true');

    // Apply category filter if specified
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply limit and ordering
    query = query
      .order('sort_order', { ascending: true })
      .limit(limit);

    const { data: tracks, error } = await query;

    console.log('🎵 get-study-music: Query result - tracks found:', tracks?.length || 0);
    if (tracks?.length > 0) {
      console.log('🎵 get-study-music: First track:', { id: tracks[0].id, name: tracks[0].name, artist: tracks[0].artist });
    }

    if (error) {
      console.error('🎵 get-study-music: Database error:', error);
      throw error;
    }

    // Transform tracks to include storage URLs
    const transformedTracks = await Promise.all(
      (tracks || []).map(async (track) => {
        console.log('🎵 get-study-music: Processing track:', { 
          id: track.id, 
          name: track.name, 
          audio_file_path: track.audio_file_path 
        });

        // Generate signed URL for audio file - handle different path formats
        let audioSignedUrl = null;
        let audioError = null;
        
        if (track.audio_file_path) {
          try {
            const { data: audioUrl, error: urlError } = await supabase.storage
              .from('study-music')
              .createSignedUrl(track.audio_file_path, 3600); // 1 hour expiry
            
            audioSignedUrl = audioUrl?.signedUrl;
            audioError = urlError;
            
            if (urlError) {
              console.error('🎵 get-study-music: Audio URL error for track', track.id, ':', urlError);
            } else {
              console.log('🎵 get-study-music: Generated audio URL for track', track.id, ':', audioSignedUrl ? 'success' : 'failed');
            }
          } catch (err) {
            console.error('🎵 get-study-music: Exception generating audio URL:', err);
            audioError = err;
          }
        }

        // Generate signed URL for thumbnail if it exists
        let thumbnailUrl = null;
        if (track.thumbnail_path) {
          try {
            const { data: thumbUrl } = await supabase.storage
              .from('study-music')
              .createSignedUrl(track.thumbnail_path, 3600);
            thumbnailUrl = thumbUrl?.signedUrl || null;
          } catch (err) {
            console.error('🎵 get-study-music: Thumbnail URL error:', err);
          }
        }

        return {
          id: track.id,
          name: track.name,
          artist: track.artist,
          duration: track.duration_seconds || 300,
          youtubeUrl: audioSignedUrl || '', // Use audio URL for compatibility
          audioUrl: audioSignedUrl || '', // Direct audio URL for playback
          url: audioSignedUrl || '', // For StudyMusicManager compatibility
          thumbnailUrl: thumbnailUrl || '/placeholder-music.jpg',
          tags: track.tags || [],
          category: track.category || 'lofi',
          sortOrder: track.sort_order || 0,
          // Debug info
          _debug: {
            original_path: track.audio_file_path,
            url_generation_error: audioError?.message || null
          }
        };
      })
    );

    console.log('🎵 get-study-music: Transformed tracks count:', transformedTracks.length);

    // If no tracks found, return default track for backwards compatibility
    if (transformedTracks.length === 0) {
      console.log('🎵 get-study-music: No tracks found, returning default fallback');
      return new Response(
        JSON.stringify({
          tracks: [{
            id: 'default',
            name: 'Lofi Hip Hop Study Mix',
            artist: 'ChillHop Music',
            duration: 3600,
            youtubeUrl: '',
            audioUrl: '',
            thumbnailUrl: '/placeholder-music.jpg',
            tags: ['lofi', 'chill', 'focus'],
            category: 'lofi',
            sortOrder: 0
          }],
          total: 1,
          categories: ['lofi']
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get unique categories for response
    const categories = [...new Set(transformedTracks.map(t => t.category))];

    console.log('🎵 get-study-music: Returning', transformedTracks.length, 'tracks with categories:', categories);

    return new Response(
      JSON.stringify({
        tracks: transformedTracks,
        total: transformedTracks.length,
        categories
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch study music tracks',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});