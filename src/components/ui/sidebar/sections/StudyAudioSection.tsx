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
      console.log('🎵 Loading user selected track');
      
      // Get user's selected track
      const { data: selectedTrackRecord } = await supabase
        .from('user_selected_music_track')
        .select('track_id')
        .eq('user_id', user.id)
        .single();

      // Get track details
      const { data: trackData } = await supabase
        .from('study_music_tracks')
        .select('*')
        .eq('id', selectedTrackRecord?.track_id || '0741d13b-2ba1-46f0-849d-093b8a2db8bd')
        .single();

      if (trackData) {
        setCurrentTrackName(`${trackData.name} - ${trackData.artist}`);
        
        // Generate signed URL for audio file
        const { data: signedUrlData } = await supabase.storage
          .from('study-music')
          .createSignedUrl('tracks/focus-flow-study-sessions.mp3', 3600);
        
        const musicTrack = {
          id: trackData.id,
          name: trackData.name,
          artist: trackData.artist,
          url: signedUrlData?.signedUrl || '',
          duration: trackData.duration_seconds || 1800
        };
        
        console.log('🎵 Track loaded:', musicTrack.name, 'URL:', !!musicTrack.url);
        musicManager.setTracks([musicTrack]);
        setCurrentTrack(musicTrack);
      } else {
        setCurrentTrackName(DEFAULT_TRACK.name);
      }
      
    } catch (error) {
      console.error('🎵 Error loading track:', error);
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
        console.log('🎵 Stopping music');
        musicManager.stop();
        setIsPlayingMusic(false);
      } else {
        console.log('🎵 Starting music');
        const availableTracks = musicManager.availableTracks;
        const trackToPlay = availableTracks[0];
        
        if (trackToPlay && trackToPlay.url) {
          await musicManager.playTrack(trackToPlay.id);
          setIsPlayingMusic(true);
          console.log('🎵 Now playing:', trackToPlay.name);
        } else {
          console.log('🎵 No track available, reloading...');
          await loadUserSelectedTrack();
        }
      }
    } catch (error) {
      console.error('🎵 Play error:', error);
      setIsPlayingMusic(false);
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