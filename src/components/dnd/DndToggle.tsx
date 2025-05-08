
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, MoonOff } from 'lucide-react';
import { useDndMode } from '@/hooks/useDndMode';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const DndToggle = () => {
  const { dndSettings, isDndActive, toggleDndMode, loading } = useDndMode();
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggle = async () => {
    setIsToggling(true);
    await toggleDndMode(!isDndActive);
    setIsToggling(false);
  };
  
  // Format time range for the tooltip
  const getTimeRangeText = () => {
    if (!dndSettings.startTime || !dndSettings.endTime) return "";
    
    return `(${dndSettings.startTime} - ${dndSettings.endTime})`;
  };
  
  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-9 w-9">
        <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
      </Button>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isDndActive ? "secondary" : "ghost"}
            size="icon"
            className={`h-9 w-9 rounded-full ${isDndActive ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 hover:text-amber-900' : ''}`}
            onClick={handleToggle}
            disabled={isToggling}
          >
            {isToggling ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
            ) : isDndActive ? (
              <Moon className="h-4 w-4" />
            ) : (
              <MoonOff className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDndActive ? `DND Mode Active ${getTimeRangeText()}` : 'Enable DND Mode'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
