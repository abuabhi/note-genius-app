import { useStudyAudio } from '@/hooks/useStudyAudio';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Pause, Play } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StudyAudioSidebarWidgetProps {
  isCollapsed: boolean;
}

export const StudyAudioSidebarWidget = ({ isCollapsed }: StudyAudioSidebarWidgetProps) => {
  const { enabled, toggle, preset, setPreset, volume, setVolume } = useStudyAudio();
  const [isOpen, setIsOpen] = useState(false);

  if (isCollapsed) {
    // Collapsed view - just the music icon with tooltip
    return (
      <div className="relative group">
        <Button
          variant={enabled ? "default" : "ghost"}
          size="sm"
          onClick={toggle}
          className={cn(
            "w-full h-9 justify-center px-2",
            enabled && "bg-mint-500/10 text-mint-600 hover:bg-mint-500/20"
          )}
          aria-label="Toggle study audio"
        >
          <Music className="h-4 w-4" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bg-popover border rounded-md shadow-md px-2 py-1 text-sm text-popover-foreground whitespace-nowrap z-50">
          Study Audio {enabled ? '(Playing)' : '(Paused)'}
        </div>
      </div>
    );
  }

  // Expanded view - full controls
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between h-9 px-3",
            enabled && "bg-mint-500/10 text-mint-600"
          )}
        >
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span className="text-sm">Study Audio</span>
          </div>
          {enabled && <div className="w-2 h-2 bg-mint-500 rounded-full animate-pulse" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-3 pb-2">
        <div className="space-y-3 pt-2">
          {/* Play/Pause Button */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggle}
            className="w-full"
          >
            {enabled ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Play
              </>
            )}
          </Button>

          {/* Preset Selection */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Preset</div>
            <Select value={preset} onValueChange={(v) => setPreset(v as any)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choose preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pink-noise">Pink Noise</SelectItem>
                <SelectItem value="brown-noise">Brown Noise</SelectItem>
                <SelectItem value="soft-pad">Soft Pad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Volume Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
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