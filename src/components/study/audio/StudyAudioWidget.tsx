import { useState } from 'react';
import { useStudyAudio } from '@/hooks/useStudyAudio';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Pause, Play } from 'lucide-react';

export const StudyAudioWidget = () => {
  const { enabled, toggle, preset, setPreset, volume, setVolume } = useStudyAudio();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      <Button 
        aria-label="Study audio"
        onClick={() => setOpen((o) => !o)}
        variant={open ? 'default' : 'secondary'}
        className="rounded-full h-12 w-12 shadow"
      >
        <Music className="h-5 w-5" />
      </Button>

      {/* Panel */}
      {open && (
        <div className="mt-3 w-72 rounded-lg border bg-background text-foreground shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Study Audio</div>
            <Button size="sm" variant="outline" onClick={toggle}>
              {enabled ? <><Pause className="h-4 w-4 mr-1"/>Pause</> : <><Play className="h-4 w-4 mr-1"/>Play</>}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Preset</div>
              <Select value={preset} onValueChange={(v) => setPreset(v as any)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pink-noise">Pink Noise</SelectItem>
                  <SelectItem value="brown-noise">Brown Noise</SelectItem>
                  <SelectItem value="soft-pad">Soft Pad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(v) => setVolume(v[0] ?? 0)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyAudioWidget;
