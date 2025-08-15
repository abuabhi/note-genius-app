import { useState, useEffect } from 'react';
import { useStudyAudio } from '@/hooks/useStudyAudio';
import { StudyMusicNavLink } from './StudyMusicNavLink';
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Music, Play, Pause, Volume2, ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import AudioManager, { StudyPreset } from '@/utils/audio/AudioManager';

interface StudyAudioSectionProps {
  isCollapsed: boolean;
}

const QUICK_PRESETS: { preset: StudyPreset; name: string }[] = [
  { preset: 'pink-noise', name: 'Pink Noise' },
  { preset: 'brown-noise', name: 'Brown Noise' },
  { preset: 'rain-simulation', name: 'Rain' },
  { preset: 'soft-pad', name: 'Ambient' },
];

export const StudyAudioSection = ({ isCollapsed }: StudyAudioSectionProps) => {
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
      
      // Auto-assign tracks if user has none
      if (selectedTracks.length === 0) {
        await autoAssignDefaultTracks();
      }
    } catch (error) {
      console.error('Error checking music preferences:', error);
      setHasSelectedTracks(false);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignDefaultTracks = async () => {
    try {
      await supabase.functions.invoke('get-study-music', {
        body: { 
          userId: user?.id, 
          autoAssign: true,
          limit: 15 
        }
      });
      // Refresh preferences after auto-assignment
      setTimeout(() => checkUserMusicPreferences(), 1000);
    } catch (error) {
      console.error('Error auto-assigning tracks:', error);
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

  if (loading) {
    return null;
  }

  // Show StudyMusicNavLink if user has selected tracks
  if (hasSelectedTracks) {
    return <StudyMusicNavLink isCollapsed={isCollapsed} />;
  }

  // Show Study Audio NavLink with dropdown
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className={cn(
                "w-full justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200",
                enabled && "bg-primary/10 text-primary"
              )}
            >
              <Music className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>{enabled ? 'Stop Study Audio' : 'Play Study Audio'}</p>
            {enabled && (
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
            enabled && "bg-primary/10 text-primary",
            open && "bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Music className="h-4 w-4" />
            <span className="text-sm font-medium">Study Audio</span>
          </div>
          <div className="flex items-center gap-2">
            {enabled && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-2">
        <div className="space-y-3 pt-2">
          {/* Quick controls */}
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};