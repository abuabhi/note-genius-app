import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

// Default track for display
const DEFAULT_TRACK = {
  id: 'default-track',
  name: 'Study Music',
  artist: 'PrepGenie',
};

type StudyTrack = {
  id: string;
  name: string;
  artist: string;
  audio_file_path: string;
};

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

export const StudyAudioSection = ({ isCollapsed }: StudyAudioSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<StudyTrack | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Load user's selected track
  const loadUserSelectedTrack = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: userTrack } = await supabase
        .from('user_selected_music_track')
        .select(`
          track_id,
          study_music_tracks (
            id,
            name,
            artist,
            audio_file_path
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (userTrack?.study_music_tracks) {
        const track = userTrack.study_music_tracks as StudyTrack;
        setCurrentTrack(track);
        console.log('🎵 Track loaded:', track.name, 'Path:', track.audio_file_path);
      }
    } catch (error) {
      console.error('Error loading user track:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserSelectedTrack();
  }, [loadUserSelectedTrack]);

  const handlePlayMusic = useCallback(async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!currentTrack) {
      console.log('No track selected');
      return;
    }

    try {
      if (isPlaying && audio) {
        // Stop current audio
        audio.pause();
        setIsPlaying(false);
        return;
      }

      // Create signed URL for the audio file
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('study-music')
        .createSignedUrl(currentTrack.audio_file_path, 3600);

      if (urlError || !signedUrlData?.signedUrl) {
        console.error('Error creating signed URL:', urlError);
        return;
      }

      // Create and play audio
      const newAudio = new Audio(signedUrlData.signedUrl);
      newAudio.loop = true;
      newAudio.volume = 0.6;
      
      newAudio.addEventListener('canplaythrough', () => {
        newAudio.play().then(() => {
          setIsPlaying(true);
          setAudio(newAudio);
          console.log('🎵 Playing:', currentTrack.name);
        }).catch(error => {
          console.error('Error playing audio:', error);
        });
      });

      newAudio.addEventListener('error', (error) => {
        console.error('Audio error:', error);
        setIsPlaying(false);
      });

      newAudio.load();

    } catch (error) {
      console.error('Error in handlePlayMusic:', error);
    }
  }, [user, currentTrack, isPlaying, audio, navigate]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const displayTrack = currentTrack || DEFAULT_TRACK;

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlayMusic}
        className={cn(
          "w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200",
          isPlaying && "bg-primary/10 text-primary"
        )}
      >
        <Music className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">{displayTrack.name}</div>
              <div className="text-xs opacity-60 truncate">
                {isPlaying ? 'Now playing' : displayTrack.artist}
              </div>
            </div>
            {isPlaying ? (
              <PauseCircle className="h-5 w-5 shrink-0" />
            ) : (
              <PlayCircle className="h-5 w-5 shrink-0" />
            )}
          </>
        )}
        {isCollapsed && (
          <>
            {isPlaying ? (
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