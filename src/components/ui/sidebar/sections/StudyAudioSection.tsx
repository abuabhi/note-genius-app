import { useState, useEffect } from 'react';
import { useStudyAudio } from '@/hooks/useStudyAudio';
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Music, Play, Pause, Volume2, ChevronDown, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import AudioManager, { StudyPreset } from '@/utils/audio/AudioManager';
import StudyMusicManager, { StudyMusicTrack } from '@/utils/audio/StudyMusicManager';
import { useNavigate } from 'react-router-dom';

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

const QUICK_PRESETS: { preset: StudyPreset; name: string }[] = [
  { preset: 'pink-noise', name: 'Pink Noise' },
  { preset: 'brown-noise', name: 'Brown Noise' },
  { preset: 'rain-simulation', name: 'Rain' },
  { preset: 'soft-pad', name: 'Ambient' },
];

// Default YouTube tracks - first 3 tracks for all users
const DEFAULT_YOUTUBE_TRACKS = [
  {
    id: 'lofi-1',
    name: 'Lofi Hip Hop Study Mix',
    artist: 'ChilledCow',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    tags: ['lofi', 'hip-hop', 'relaxing', 'focus'],
    category: 'Lo-fi Hip Hop'
  },
  {
    id: 'ambient-1',
    name: 'Ambient Space Music',
    artist: 'Cryo Chamber',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=YVZKGaKnCN8',
    thumbnailUrl: 'https://img.youtube.com/vi/YVZKGaKnCN8/mqdefault.jpg',
    tags: ['ambient', 'space', 'atmospheric', 'deep-focus'],
    category: 'Ambient'
  },
  {
    id: 'classical-1',
    name: 'Classical Piano for Studying',
    artist: 'Halidon Music',
    duration: 3600,
    youtubeUrl: 'https://www.youtube.com/watch?v=jgpJVI3tDbY',
    thumbnailUrl: 'https://img.youtube.com/vi/jgpJVI3tDbY/mqdefault.jpg',
    tags: ['classical', 'piano', 'studying', 'concentration'],
    category: 'Classical'
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
  const { enabled, toggle, preset, setPreset, volume, setVolume } = useStudyAudio();
  const [open, setOpen] = useState(false);
  const [useYouTubeTracks, setUseYouTubeTracks] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<StudyTrack[]>(DEFAULT_YOUTUBE_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.6);

  const musicManager = StudyMusicManager.instance;

  useEffect(() => {
    if (user) {
      loadUserTracks();
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
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      const trackIds = preferences?.selectedTracks || [];
      
      if (trackIds.length > 0) {
        // User has custom tracks, load them
        const { data: tracksData } = await supabase.functions.invoke('get-study-music', {
          body: { limit: 50 }
        });
        
        const allTracks = tracksData?.tracks || [];
        const userTracks = allTracks.filter((track: StudyTrack) => trackIds.includes(track.id));
        
        if (userTracks.length > 0) {
          setSelectedTracks(userTracks);
          setUseYouTubeTracks(true);
          
          // Set up music manager with user tracks
          const musicTracks: StudyMusicTrack[] = userTracks.map((track: StudyTrack) => ({
            id: track.id,
            name: track.name,
            artist: track.artist,
            url: track.youtubeUrl,
            duration: track.duration
          }));
          musicManager.setTracks(musicTracks);
        }
      } else {
        // Use default tracks
        setSelectedTracks(DEFAULT_YOUTUBE_TRACKS);
        setUseYouTubeTracks(true);
        
        // Set up music manager with default tracks
        const musicTracks: StudyMusicTrack[] = DEFAULT_YOUTUBE_TRACKS.map(track => ({
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
      // Fallback to default tracks
      setSelectedTracks(DEFAULT_YOUTUBE_TRACKS);
      setUseYouTubeTracks(true);
    }
  };

  const handlePresetChange = async (newPreset: StudyPreset) => {
    if (enabled && preset !== newPreset) {
      AudioManager.instance.stop(0.1);
      setPreset(newPreset);
      setTimeout(() => {
        AudioManager.instance.play(0.2);
      }, 150);
    } else {
      setPreset(newPreset);
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
                (enabled || isPlayingMusic) && "bg-primary/10 text-primary"
              )}
            >
              <Music className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>Study Audio</p>
            {useYouTubeTracks && currentTrack && (
              <p className="text-xs text-muted-foreground">
                {isPlayingMusic ? 'Playing' : 'Stopped'}: {currentTrack.name}
              </p>
            )}
            {!useYouTubeTracks && enabled && (
              <p className="text-xs text-muted-foreground">
                Playing: {QUICK_PRESETS.find(s => s.preset === preset)?.name || preset}
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
            (enabled || isPlayingMusic) && "bg-primary/10 text-primary",
            open && "bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">Study Audio</span>
          </div>
          <div className="flex items-center gap-2">
            {(enabled || isPlayingMusic) && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-2">
        <div className="space-y-3 pt-2">
          {useYouTubeTracks ? (
            <>
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
                          {currentTrack?.id === track.id && isPlayingMusic ? (
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
            </>
          ) : (
            <>
              {/* Traditional Study Audio Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={enabled ? "destructive" : "default"}
                  onClick={toggle}
                  className="h-7 px-3 text-xs flex-1"
                >
                  {enabled ? (
                    <><Pause className="h-3 w-3 mr-1"/>Stop</>
                  ) : (
                    <><Play className="h-3 w-3 mr-1"/>Play</>
                  )}
                </Button>
              </div>

              {/* Current sound */}
              {enabled && (
                <div className="text-xs text-muted-foreground">
                  Playing: <span className="text-foreground font-medium">
                    {QUICK_PRESETS.find(s => s.preset === preset)?.name || preset}
                  </span>
                </div>
              )}

              {/* Quick presets */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Quick Select</div>
                <div className="grid gap-1">
                  {QUICK_PRESETS.map((sound) => (
                    <Button
                      key={sound.preset}
                      variant={preset === sound.preset ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-2 text-xs justify-start"
                      onClick={() => {
                        handlePresetChange(sound.preset);
                        if (!enabled) toggle();
                      }}
                    >
                      {sound.name}
                      {enabled && preset === sound.preset && (
                        <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse ml-auto" />
                      )}
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
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};