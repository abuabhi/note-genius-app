import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import StudyMusicManager, { StudyMusicTrack } from "@/utils/audio/StudyMusicManager";
import { supabase } from "@/integrations/supabase/client";

// Default track
const DEFAULT_TRACK = {
  id: 'lofi-1',
  name: 'Lofi Hip Hop Study Mix',
  artist: 'ChillHop Music',
  url: '', // YouTube URLs can't be played directly, we'll use this for display
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

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

export const StudyAudioSection = ({ isCollapsed }: StudyAudioSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [currentTrackName, setCurrentTrackName] = useState(DEFAULT_TRACK.name);

  const musicManager = StudyMusicManager.instance;

  // Load user's selected track on mount and when user changes
  useEffect(() => {
    if (user) {
      loadUserSelectedTrack();
    }
  }, [user]);

  const loadUserSelectedTrack = async () => {
    if (!user) return;
    
    try {
      console.log('🎵 StudyAudioSection: Loading user selected track for user:', user.id);
      
      // First, get tracks from edge function to ensure we have signed URLs
      const { data: tracksData, error: tracksError } = await supabase.functions.invoke('get-study-music', {
        body: { category: 'all', limit: 50 }
      });
      
      if (tracksError) {
        console.error('🎵 StudyAudioSection: Error fetching tracks from edge function:', tracksError);
        setCurrentTrackName(DEFAULT_TRACK.name);
        return;
      }
      
      const availableTracks = tracksData?.tracks || [];
      console.log('🎵 StudyAudioSection: Fetched', availableTracks.length, 'tracks from edge function');
      
      // Get user's selected track ID
      const { data: selectedTrackRecord } = await supabase
        .from('user_selected_music_track')
        .select('track_id')
        .eq('user_id', user.id)
        .single();

      let trackToUse = null;
      
      if (selectedTrackRecord?.track_id) {
        // Find the selected track in available tracks
        trackToUse = availableTracks.find((t: any) => t.id === selectedTrackRecord.track_id);
        console.log('🎵 StudyAudioSection: Found user selected track:', trackToUse?.name);
      }
      
      if (!trackToUse && availableTracks.length > 0) {
        // Use first available track as fallback
        trackToUse = availableTracks[0];
        console.log('🎵 StudyAudioSection: Using fallback track:', trackToUse?.name);
      }

      if (trackToUse) {
        setCurrentTrackName(`${trackToUse.name} - ${trackToUse.artist}`);
        
        // Use the signed URL from edge function response
        const musicTrack = {
          id: trackToUse.id,
          name: trackToUse.name,
          artist: trackToUse.artist,
          url: trackToUse.audioUrl || trackToUse.url || trackToUse.youtubeUrl || '',
          duration: trackToUse.duration || 1800
        };
        
        console.log('🎵 StudyAudioSection: Setting track in music manager:', {
          id: musicTrack.id,
          name: musicTrack.name,
          hasUrl: !!musicTrack.url
        });
        
        musicManager.setTracks([musicTrack]);
        return;
      }
      
      // Final fallback to default track if no tracks available
      console.log('🎵 StudyAudioSection: No tracks available, using default');
      setCurrentTrackName(DEFAULT_TRACK.name);
      const defaultMusicTrack = {
        id: DEFAULT_TRACK.id,
        name: DEFAULT_TRACK.name,
        artist: DEFAULT_TRACK.artist,
        url: DEFAULT_TRACK.url,
        duration: 3600
      };
      musicManager.setTracks([defaultMusicTrack]);
      
    } catch (error) {
      console.error('🎵 StudyAudioSection: Error loading user track:', error);
      // Fallback to default
      setCurrentTrackName(DEFAULT_TRACK.name);
    }
  };

  // Listen for realtime updates to user's music track selection
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('music-track-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_selected_music_track',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Music track selection updated:', payload);
          loadUserSelectedTrack();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handlePlayMusic = useCallback(async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      console.log('🎵 StudyAudioSection: Handle play music - current state:', { 
        isPlayingMusic, 
        hasCurrentTrack: !!currentTrack,
        currentTrackName 
      });
      
      if (isPlayingMusic) {
        console.log('🎵 StudyAudioSection: Stopping music');
        musicManager.stop();
        setIsPlayingMusic(false);
        setCurrentTrack(null);
      } else {
        // Play the user's selected track or default
        const availableTracks = musicManager.availableTracks;
        const trackToPlay = availableTracks[0]; // First (and only) track
        
        console.log('🎵 StudyAudioSection: Available tracks:', availableTracks.length);
        console.log('🎵 StudyAudioSection: Track to play:', {
          id: trackToPlay?.id,
          name: trackToPlay?.name,
          hasUrl: !!trackToPlay?.url
        });
        
        if (trackToPlay && trackToPlay.url) {
          console.log('🎵 StudyAudioSection: Playing track:', trackToPlay.name);
          await musicManager.playTrack(trackToPlay.id);
          setIsPlayingMusic(true);
          setCurrentTrack(trackToPlay);
        } else {
          console.error('🎵 StudyAudioSection: Cannot play - no valid track available');
          // Try to reload tracks
          await loadUserSelectedTrack();
        }
      }
    } catch (error) {
      console.error('🎵 StudyAudioSection: Error playing music:', error);
      setIsPlayingMusic(false);
      setCurrentTrack(null);
    }
  }, [isPlayingMusic, user, navigate, currentTrack, currentTrackName]);

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayMusic}
        className={cn(
          "w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200",
          isPlayingMusic && "bg-primary/10 text-primary"
        )}
      >
        <Music className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">Study Music</div>
            </div>
            {isPlayingMusic ? (
              <PauseCircle className="h-5 w-5 shrink-0" />
            ) : (
              <PlayCircle className="h-5 w-5 shrink-0" />
            )}
          </>
        )}
        {isCollapsed && (
          <>
            {isPlayingMusic ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </>
        )}
      </Button>
    </div>
  );
};