
import { Clock, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const SessionDock = () => {
  const {
    isActive: isSessionActive,
    elapsedSeconds,
    isPaused,
    togglePause,
    endSession,
    isOnStudyPage
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

  // Determine theme based on session state
  const getSessionTheme = () => {
    if (!isOnStudyPage) {
      // Idle/inactive theme - red/gray
      return {
        background: 'bg-slate-800/95 border-red-500/60',
        text: 'text-red-100',
        timeText: 'text-red-200',
        iconColor: 'text-red-300',
        buttonHover: 'hover:bg-red-500/20',
        animation: ''
      };
    }
    
    if (isPaused) {
      // Paused theme - yellow/orange
      return {
        background: 'bg-slate-800/95 border-orange-500/60',
        text: 'text-orange-100',
        timeText: 'text-orange-200',
        iconColor: 'text-orange-300',
        buttonHover: 'hover:bg-orange-500/20',
        animation: ''
      };
    }
    
    // Active theme - green/blue with pulse
    return {
      background: 'bg-slate-900/95 border-mint-500/60',
      text: 'text-mint-100',
      timeText: 'text-mint-200',
      iconColor: 'text-mint-300',
      buttonHover: 'hover:bg-mint-500/20',
      animation: 'animate-pulse'
    };
  };

  const theme = getSessionTheme();

  return (
    <Card className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl backdrop-blur-sm border-2 hover:shadow-3xl transition-all duration-300",
      theme.background,
      theme.animation
    )}>
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Clock className={cn("h-5 w-5", theme.iconColor)} />
            {!isPaused && isOnStudyPage && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-mint-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={cn("text-lg font-mono font-bold tracking-wider", theme.timeText)}>
              {formatTime(elapsedSeconds)}
            </span>
            <span className={cn("text-xs font-medium", theme.text)}>
              {!isOnStudyPage ? 'Not Studying' : isPaused ? 'Paused' : 'Active Session'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 ml-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePause}
                  className={cn(
                    "h-10 w-10 p-0 border border-transparent transition-all duration-200",
                    theme.buttonHover,
                    "hover:border-current/20 hover:scale-110"
                  )}
                >
                  {isPaused ? (
                    <Play className={cn("h-5 w-5", theme.iconColor)} />
                  ) : (
                    <Pause className={cn("h-5 w-5", theme.iconColor)} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-600">
                {isPaused ? 'Resume Session' : 'Pause Session'}
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
                  className={cn(
                    "h-10 w-10 p-0 border border-transparent transition-all duration-200",
                    "hover:bg-red-500/20 hover:border-red-500/20 hover:scale-110"
                  )}
                >
                  <Square className="h-5 w-5 text-red-300 hover:text-red-200" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-600">
                End Session
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};
