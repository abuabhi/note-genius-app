import { useState, useEffect } from 'react';
import { useStudyAudio } from '@/hooks/useStudyAudio';
import { StudyMusicSidebarWidget } from './StudyMusicSidebarWidget';
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Music, Play, Pause, Volume2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import AudioManager, { StudyPreset } from '@/utils/audio/AudioManager';

interface ImprovedStudyAudioSidebarWidgetProps {
  isCollapsed: boolean;
}

const TOP_SOUNDS: { preset: StudyPreset; name: string; description: string }[] = [
  { preset: 'pink-noise', name: 'Pink Noise', description: 'Most effective for concentration' },
  { preset: 'brown-noise', name: 'Brown Noise', description: 'Deeper, warmer sound' },
  { preset: 'rain-simulation', name: 'Rain', description: 'Natural rain sounds' },
  { preset: 'soft-pad', name: 'Ambient Pad', description: 'Soft musical background' },
  { preset: 'binaural-alpha', name: 'Alpha Waves', description: 'Focus-enhancing binaural beats' },
];

export const ImprovedStudyAudioSidebarWidget = ({ isCollapsed }: ImprovedStudyAudioSidebarWidgetProps) => {
  const { user } = useAuth();
  const { enabled, toggle, preset, setPreset, volume, setVolume } = useStudyAudio();
  const [open, setOpen] = useState(false);
  const [hasSelectedTracks, setHasSelectedTracks] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserMusicPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkUserMusicPreferences = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('study_music_preferences')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const preferences = profile?.study_music_preferences as { selectedTracks?: string[] } | null;
      const selectedTracks = preferences?.selectedTracks || [];
      setHasSelectedTracks(selectedTracks.length > 0);
    } catch (error) {
      console.error('Error checking music preferences:', error);
      setHasSelectedTracks(false);
    } finally {
      setLoading(false);
    }
  };

  // If user has selected music tracks, show the music widget instead
  if (loading) {
    return (
      <div className="flex items-center px-3 py-2 text-sm text-muted-foreground">
        <Music className="h-4 w-4 mr-2" />
        {!isCollapsed && "Loading..."}
      </div>
    );
  }

  if (hasSelectedTracks) {
    return <StudyMusicSidebarWidget isCollapsed={isCollapsed} />;
  }

  const handlePresetChange = async (newPreset: StudyPreset) => {
    if (enabled && preset !== newPreset) {
      // Smooth transition between sounds
      AudioManager.instance.stop(0.1);
      setPreset(newPreset);
      setTimeout(() => {
        AudioManager.instance.play(0.2);
      }, 150);
    } else {
      setPreset(newPreset);
    }
  };

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={cn(
                "w-full h-10 rounded-lg transition-all duration-200",
                enabled && "bg-primary/10 text-primary animate-pulse"
              )}
            >
              <Music className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>{enabled ? 'Stop Study Audio' : 'Play Study Audio'}</p>
            {enabled && (
              <p className="text-xs text-muted-foreground">
                Playing: {TOP_SOUNDS.find(s => s.preset === preset)?.name || preset}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Study Audio</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <Button
            size="sm"
            variant={enabled ? "destructive" : "default"}
            onClick={toggle}
            className="h-7 px-2 text-xs"
          >
            {enabled ? (
              <><Pause className="h-3 w-3 mr-1"/>Stop</>
            ) : (
              <><Play className="h-3 w-3 mr-1"/>Play</>
            )}
          </Button>
        </div>

        <CollapsibleContent className="space-y-3">
          {/* Current sound display */}
          {enabled && (
            <div className="text-xs text-muted-foreground">
              Playing: <span className="text-foreground font-medium">
                {TOP_SOUNDS.find(s => s.preset === preset)?.name || preset}
              </span>
            </div>
          )}

          {/* Top sounds grid */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Quick Select</div>
            <div className="grid gap-1">
              {TOP_SOUNDS.slice(0, 3).map((sound) => (
                <Card 
                  key={sound.preset}
                  className={cn(
                    "p-2 cursor-pointer transition-all duration-200 hover:shadow-sm",
                    preset === sound.preset && "border-primary bg-primary/5",
                    enabled && preset === sound.preset && "shadow-sm"
                  )}
                  onClick={() => handlePresetChange(sound.preset)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{sound.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{sound.description}</div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {enabled && preset === sound.preset && (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      )}
                      <Button
                        size="sm"
                        variant={preset === sound.preset ? "default" : "outline"}
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (preset === sound.preset) {
                            toggle();
                          } else {
                            handlePresetChange(sound.preset);
                            if (!enabled) toggle();
                          }
                        }}
                      >
                        {enabled && preset === sound.preset ? (
                          <Pause className="h-2.5 w-2.5" />
                        ) : (
                          <Play className="h-2.5 w-2.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImprovedStudyAudioSidebarWidget;