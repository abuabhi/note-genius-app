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
      // Get user's selected track from new table
      const { data: selectedTrackRecord } = await supabase
        .from('user_selected_music_track')
        .select(`
          track_id,
          study_music_tracks (
            id,
            name,
            artist,
            audio_file_path,
            duration_seconds
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (selectedTrackRecord?.study_music_tracks) {
        const track = selectedTrackRecord.study_music_tracks as any;
        setCurrentTrackName(`${track.name} - ${track.artist}`);
        
        // Generate storage URL for the audio file
        const { data: audioUrl } = await supabase.storage
          .from('study-music')
          .createSignedUrl(track.audio_file_path, 3600);
        
        // Set up track in music manager with real audio URL
        const musicTrack = {
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: audioUrl?.signedUrl || '',
          duration: track.duration_seconds || 1800
        };
        musicManager.setTracks([musicTrack]);
        return;
      }
      
      // Fallback: Get first available track from database
      const { data } = await supabase.functions.invoke('get-study-music', {
        body: { category: 'all', limit: 1 }
      });

      const tracks = data?.tracks || [];
      if (tracks.length > 0) {
        const track = tracks[0];
        setCurrentTrackName(`${track.name} - ${track.artist}`);
        
        const musicTrack = {
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: track.audioUrl || track.youtubeUrl,
          duration: track.duration
        };
        musicManager.setTracks([musicTrack]);
        return;
      }
      
      // Final fallback to default track if database is empty
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
      console.error('Error loading user track:', error);
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
      if (isPlayingMusic) {
        musicManager.stop();
        setIsPlayingMusic(false);
        setCurrentTrack(null);
      } else {
        // Play the user's selected track or default
        const availableTracks = musicManager.availableTracks;
        const trackToPlay = availableTracks[0]; // First (and only) track
        
        if (trackToPlay) {
          await musicManager.playTrack(trackToPlay.id);
          setIsPlayingMusic(true);
          setCurrentTrack(trackToPlay);
        }
      }
    } catch (error) {
      console.error('Error playing music:', error);
      setIsPlayingMusic(false);
      setCurrentTrack(null);
    }
  }, [isPlayingMusic, user, navigate]);

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