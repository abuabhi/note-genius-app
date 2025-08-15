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

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

// Default YouTube tracks - first 3 tracks for all users
const DEFAULT_YOUTUBE_TRACKS = [
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
  }
];

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

export const StudyAudioSection = ({ isCollapsed }: StudyAudioSectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<StudyTrack[]>(DEFAULT_YOUTUBE_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [loading, setLoading] = useState(false);

  const musicManager = StudyMusicManager.instance;

  useEffect(() => {
    if (user) {
      loadUserTracks();
      // Set up real-time subscription for profile changes
      const subscription = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => {
            loadUserTracks();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
    
    // Set initial music volume
    musicManager.setVolume(musicVolume);
    
    return () => {
      musicManager.stop(0.1);
    };
  }, [user]);

  useEffect(() => {
    musicManager.setVolume(musicVolume);
  }, [musicVolume]);

  const loadUserTracks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First ensure user has default tracks if none exist
      await supabase.functions.invoke('get-study-music', {
        body: { 
          userId: user.id, 
          ensureDefaults: true,
          limit: 50 
        }
      });

      // Then get user's current preferences
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      const trackIds = preferences?.selectedTracks || ['lofi-1', 'ambient-1', 'classical-1'];
      
      if (trackIds.length > 0) {
        // Load the actual track data
        const { data: tracksData } = await supabase.functions.invoke('get-study-music', {
          body: { limit: 50 }
        });
        
        const allTracks = tracksData?.tracks || DEFAULT_YOUTUBE_TRACKS;
        const userTracks = allTracks.filter((track: StudyTrack) => trackIds.includes(track.id));
        
        // Use user tracks if found, otherwise fallback to defaults
        const finalTracks = userTracks.length > 0 ? userTracks : DEFAULT_YOUTUBE_TRACKS;
        setSelectedTracks(finalTracks);
        
        // Set up music manager with tracks
        const musicTracks: StudyMusicTrack[] = finalTracks.map((track: StudyTrack) => ({
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: track.youtubeUrl,
          duration: track.duration
        }));
        musicManager.setTracks(musicTracks);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
      // Always fallback to default tracks
      setSelectedTracks(DEFAULT_YOUTUBE_TRACKS);
      const musicTracks: StudyMusicTrack[] = DEFAULT_YOUTUBE_TRACKS.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist,
        url: track.youtubeUrl,
        duration: track.duration
      }));
      musicManager.setTracks(musicTracks);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPlay = async (track: StudyTrack) => {
    if (currentTrack?.id === track.id && isPlayingMusic) {
      musicManager.stop();
      setIsPlayingMusic(false);
      setCurrentTrack(null);
    } else {
      try {
        await musicManager.playTrack(track.id);
        setCurrentTrack({
          id: track.id,
          name: track.name,
          artist: track.artist,
          url: track.youtubeUrl,
          duration: track.duration
        });
        setIsPlayingMusic(true);
      } catch (error) {
        console.error('Error playing track:', error);
      }
    }
  };

  const handleManageMusic = () => {
    navigate('/settings?tab=music');
  };

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
                isPlayingMusic && "bg-primary/10 text-primary"
              )}
            >
              <Music className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>Study Audio</p>
            {currentTrack && (
              <p className="text-xs text-muted-foreground">
                {isPlayingMusic ? 'Playing' : 'Stopped'}: {currentTrack.name}
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
            isPlayingMusic && "bg-primary/10 text-primary",
            open && "bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">Study Audio</span>
          </div>
          <div className="flex items-center gap-2">
            {isPlayingMusic && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-2">
        <div className="space-y-3 pt-2">
          {/* Current track info */}
          {currentTrack && (
            <div className="text-xs text-muted-foreground">
              {isPlayingMusic ? 'Playing' : 'Stopped'}: <span className="text-foreground font-medium">
                {currentTrack.name}
              </span>
            </div>
          )}

          {/* Track list */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Your Tracks ({selectedTracks.length}/3)
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {loading ? (
                <div className="text-xs text-muted-foreground text-center py-2">
                  Loading tracks...
                </div>
              ) : (
                selectedTracks.map((track) => (
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
                        {currentTrack?.id === track.id && isPlayingMusic ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Volume control for music */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span>Volume</span>
              </div>
              <span className="text-muted-foreground">{Math.round(musicVolume * 100)}%</span>
            </div>
            <Slider
              value={[musicVolume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(v) => setMusicVolume(v[0] ?? 0)}
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