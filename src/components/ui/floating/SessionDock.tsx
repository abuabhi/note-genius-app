
import { Clock, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const SessionDock = () => {
  const {
    isActive: isSessionActive,
    elapsedSeconds,
    isPaused,
    togglePause,
    endSession
  } = useGlobalSessionTracker();

  // Don't show if no active session
  if (!isSessionActive) {
    return null;
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg bg-white/95 backdrop-blur-sm border-mint-200 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-mint-600" />
          <span className="text-sm font-mono font-medium text-mint-700">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePause}
                  className="h-8 w-8 p-0 hover:bg-mint-100"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4 text-mint-600" />
                  ) : (
                    <Pause className="h-4 w-4 text-mint-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPaused ? 'Resume' : 'Pause'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={endSession}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                >
                  <Square className="h-4 w-4 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                End Session
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};
