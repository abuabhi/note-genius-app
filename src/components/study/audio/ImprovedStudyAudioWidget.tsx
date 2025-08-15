import { useState } from 'react';
import { useStudyAudio } from '@/hooks/useStudyAudio';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Music, Play, Pause, Volume2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import AudioManager, { StudyPreset } from '@/utils/audio/AudioManager';

const TOP_SOUNDS: { preset: StudyPreset; name: string; description: string }[] = [
  { preset: 'pink-noise', name: 'Pink Noise', description: 'Most effective for concentration' },
  { preset: 'brown-noise', name: 'Brown Noise', description: 'Deeper, warmer sound' },
  { preset: 'rain-simulation', name: 'Rain', description: 'Natural rain sounds' },
  { preset: 'soft-pad', name: 'Ambient Pad', description: 'Soft musical background' },
  { preset: 'binaural-alpha', name: 'Alpha Waves', description: 'Focus-enhancing binaural beats' },
];

const ALL_SOUNDS: { preset: StudyPreset; name: string; category: string }[] = [
  { preset: 'white-noise', name: 'White Noise', category: 'Noise Therapy' },
  { preset: 'violet-noise', name: 'Violet Noise', category: 'Noise Therapy' },
  { preset: 'blue-noise', name: 'Blue Noise', category: 'Noise Therapy' },
  { preset: 'gray-noise', name: 'Gray Noise', category: 'Noise Therapy' },
  { preset: 'binaural-theta', name: 'Theta Waves', category: 'Binaural Focus' },
  { preset: 'ocean-waves', name: 'Ocean Waves', category: 'Nature Sounds' },
  { preset: 'forest-ambience', name: 'Forest Ambience', category: 'Nature Sounds' },
  { preset: 'crickets', name: 'Crickets', category: 'Nature Sounds' },
  { preset: 'sine-drone', name: 'Sine Drone', category: 'Ambient Tones' },
  { preset: 'wind-chimes', name: 'Wind Chimes', category: 'Ambient Tones' },
  { preset: 'breathing-rhythm', name: 'Breathing Rhythm', category: 'Ambient Tones' },
];

export const ImprovedStudyAudioWidget = () => {
  const { enabled, toggle, preset, setPreset, volume, setVolume } = useStudyAudio();
  const [open, setOpen] = useState(false);
  const [showAllSounds, setShowAllSounds] = useState(false);

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

  const currentSound = TOP_SOUNDS.find(s => s.preset === preset) || 
                      ALL_SOUNDS.find(s => s.preset === preset);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            aria-label="Study audio"
            variant={enabled ? 'default' : 'secondary'}
            className={cn(
              "rounded-full h-12 w-12 shadow-lg transition-all duration-200",
              enabled && "animate-pulse"
            )}
          >
            <Music className="h-5 w-5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          side="top" 
          align="end" 
          className="w-80 p-0 bg-background/95 backdrop-blur-sm border shadow-xl"
        >
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Study Sounds</h3>
              <Button 
                size="sm" 
                variant={enabled ? "destructive" : "default"}
                onClick={toggle}
                className="min-w-[80px]"
              >
                {enabled ? (
                  <><Pause className="h-4 w-4 mr-1"/>Stop</>
                ) : (
                  <><Play className="h-4 w-4 mr-1"/>Play</>
                )}
              </Button>
            </div>

            {/* Current sound display */}
            {currentSound && (
              <div className="text-sm text-muted-foreground">
                Playing: <span className="text-foreground font-medium">{currentSound.name}</span>
              </div>
            )}

            {/* Top 5 sounds grid */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Popular Sounds</div>
              <div className="grid gap-2">
                {TOP_SOUNDS.map((sound) => (
                  <Card 
                    key={sound.preset}
                    className={cn(
                      "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
                      preset === sound.preset && "border-primary bg-primary/5",
                      enabled && preset === sound.preset && "shadow-md"
                    )}
                    onClick={() => handlePresetChange(sound.preset)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{sound.name}</div>
                        <div className="text-xs text-muted-foreground">{sound.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {enabled && preset === sound.preset && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        <Button
                          size="sm"
                          variant={preset === sound.preset ? "default" : "outline"}
                          className="h-8 w-8 p-0"
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
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* More sounds collapsible */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSounds(!showAllSounds)}
                className="w-full justify-between text-sm"
              >
                <span>More Sounds ({ALL_SOUNDS.length})</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", showAllSounds && "rotate-180")} />
              </Button>
              
              {showAllSounds && (
                <div className="grid gap-1 max-h-40 overflow-y-auto">
                  {ALL_SOUNDS.map((sound) => (
                    <div
                      key={sound.preset}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                        "hover:bg-muted",
                        preset === sound.preset && "bg-primary/10 text-primary"
                      )}
                      onClick={() => handlePresetChange(sound.preset)}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{sound.name}</div>
                        <div className="text-xs text-muted-foreground">{sound.category}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
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
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Volume control */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ImprovedStudyAudioWidget;