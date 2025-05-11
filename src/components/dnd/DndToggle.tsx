
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ban } from 'lucide-react';
import { useDndMode } from '@/hooks/useDndMode';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const DndToggle = () => {
  const { dndSettings, isDndActive, toggleDnd, isLoading } = useDndMode();
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggle = async () => {
    setIsToggling(true);
    await toggleDnd();
    setIsToggling(false);
  };
  
  // Format time range for the tooltip
  const getTimeRangeText = () => {
    if (!dndSettings.startTime || !dndSettings.endTime) return "";
    
    return `(${dndSettings.startTime} - ${dndSettings.endTime})`;
  };
  
  if (isLoading) {
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
            variant={isDndActive ? "destructive" : "ghost"}
            size="icon"
            className={`h-9 w-9 rounded-full ${isDndActive ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={handleToggle}
            disabled={isToggling}
          >
            {isToggling ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
            ) : (
              <Ban className="h-5 w-5" />
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
