import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Music, Play, Pause, Volume2, ChevronDown, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import StudyMusicManager, { StudyMusicTrack } from '@/utils/audio/StudyMusicManager';
import { useNavigate } from 'react-router-dom';

interface StudyMusicNavLinkProps {
  isCollapsed: boolean;
}

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

export const StudyMusicNavLink = ({ isCollapsed }: StudyMusicNavLinkProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<StudyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const musicManager = StudyMusicManager.instance;

  useEffect(() => {
    if (user) {
      loadUserSelectedTracks();
    }
    
    // Set initial volume
    musicManager.setVolume(volume);
    
    return () => {
      musicManager.stop(0.1);
    };
  }, [user]);

  useEffect(() => {
    musicManager.setVolume(volume);
  }, [volume]);

  const loadUserSelectedTracks = async () => {
    try {
      setLoading(true);
      
      // Get user's selected track IDs
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      const trackIds = preferences?.selectedTracks || [];
      
      if (trackIds.length === 0) {
        setSelectedTracks([]);
        setLoading(false);
        return;
      }

      // Get track data from edge function
      const { data: tracksData, error: tracksError } = await supabase.functions.invoke('get-study-music', {
        body: { limit: 50 }
      });

      if (tracksError) throw tracksError;

      const allTracks = tracksData?.tracks || [];
      const userTracks = allTracks.filter((track: StudyTrack) => trackIds.includes(track.id));
      
      setSelectedTracks(userTracks);
      
      // Convert to StudyMusicManager format and set tracks
      const musicTracks: StudyMusicTrack[] = userTracks.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist,
        url: track.youtubeUrl,
        duration: track.duration
      }));
      
      musicManager.setTracks(musicTracks);
      
    } catch (error) {
      console.error('Error loading user tracks:', error);
      setSelectedTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPlay = async (track: StudyTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      musicManager.stop();
      setIsPlaying(false);
      setCurrentTrack(null);
    } else {
      try {
        // For now, we'll use the YouTube URL directly
        // In a real implementation, you'd want to extract the audio first
        await musicManager.playTrack(track.id);
        setCurrentTrack({
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: track.youtubeUrl,
          duration: track.duration
        });
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing track:', error);
      }
    }
  };

  const handleManageMusic = () => {
    navigate('/settings?tab=music');
  };

  if (loading) {
    return null;
  }

  if (selectedTracks.length === 0) {
    return null;
  }

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200",
                isPlaying && "bg-primary/10 text-primary"
              )}
            >
              <Music className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>Study Music</p>
            {currentTrack && (
              <p className="text-xs text-muted-foreground">
                {isPlaying ? 'Playing' : 'Stopped'}: {currentTrack.name}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-between gap-3 h-10 px-3 rounded-lg transition-all duration-200 group",
            isPlaying && "bg-primary/10 text-primary",
            open && "bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">Study Music</span>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-2">
        <div className="space-y-3 pt-2">
          {/* Current track info */}
          {currentTrack && (
            <div className="text-xs text-muted-foreground">
              {isPlaying ? 'Playing' : 'Stopped'}: <span className="text-foreground font-medium">
                {currentTrack.name}
              </span>
            </div>
          )}

          {/* Track list */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Your Tracks</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedTracks.map((track) => (
                <Button
                  key={track.id}
                  variant={currentTrack?.id === track.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full h-auto p-2 text-xs justify-start"
                  onClick={() => handleTrackPlay(track)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium truncate">{track.name}</div>
                      <div className="text-muted-foreground truncate">{track.artist}</div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Volume control */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span>Volume</span>
              </div>
              <span className="text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(v) => setVolume(v[0] ?? 0)}
              className="w-full"
            />
          </div>

          {/* Manage music link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageMusic}
            className="w-full h-7 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Manage Music
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};