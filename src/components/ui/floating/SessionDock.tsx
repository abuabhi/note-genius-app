
import { Clock, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSimpleSessionTracker } from '@/hooks/useSimpleSessionTracker';
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
  } = useSimpleSessionTracker();

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

  // Enhanced status display based on session state
  const getSessionStatus = () => {
    if (!isOnStudyPage) {
      return 'Away from Study';
    }
    if (isPaused) {
      return 'Paused';
    }
    return 'Active Session';
  };

  // Determine theme based on session state
  const getSessionTheme = () => {
    if (!isOnStudyPage) {
      // Away from study - orange theme with subtle indicator
      return {
        background: 'bg-slate-800/90 border-orange-400/40',
        text: 'text-orange-100',
        timeText: 'text-orange-200',
        iconColor: 'text-orange-300',
        buttonHover: 'hover:bg-orange-500/15',
        indicator: 'bg-orange-400'
      };
    }
    
    if (isPaused) {
      // Paused on study page - muted orange
      return {
        background: 'bg-slate-800/90 border-orange-400/40',
        text: 'text-orange-100',
        timeText: 'text-orange-200',
        iconColor: 'text-orange-300',
        buttonHover: 'hover:bg-orange-500/15',
        indicator: 'bg-orange-400'
      };
    }
    
    // Active on study page - mint theme with pulse
    return {
      background: 'bg-slate-800/90 border-mint-400/40',
      text: 'text-mint-100',
      timeText: 'text-mint-200',
      iconColor: 'text-mint-300',
      buttonHover: 'hover:bg-mint-500/15',
      indicator: 'bg-mint-400'
    };
  };

  const theme = getSessionTheme();

  return (
    <Card className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-xl backdrop-blur-sm border transition-all duration-300",
      theme.background,
      "hover:shadow-2xl"
    )}>
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Clock className={cn("h-4 w-4", theme.iconColor)} />
            {/* Indicator - pulse when active and on study page */}
            {!isPaused && isOnStudyPage && (
              <div className={cn(
                "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse",
                theme.indicator,
                "opacity-75"
              )} />
            )}
            {/* Static indicator when away from study but session is running */}
            {!isOnStudyPage && (
              <div className={cn(
                "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                theme.indicator,
                "opacity-60"
              )} />
            )}
          </div>
          <div className="flex flex-col">
            <span className={cn("text-base font-mono font-semibold tracking-wide", theme.timeText)}>
              {formatTime(elapsedSeconds)}
            </span>
            <span className={cn("text-xs font-medium", theme.text)}>
              {getSessionStatus()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-1.5 ml-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePause}
                  className={cn(
                    "h-9 w-9 p-0 border border-transparent transition-all duration-200",
                    theme.buttonHover,
                    "hover:border-current/15 hover:scale-105"
                  )}
                >
                  {isPaused ? (
                    <Play className={cn("h-4 w-4", theme.iconColor)} />
                  ) : (
                    <Pause className={cn("h-4 w-4", theme.iconColor)} />
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
                    "h-9 w-9 p-0 border border-transparent transition-all duration-200",
                    "hover:bg-red-500/15 hover:border-red-500/15 hover:scale-105"
                  )}
                >
                  <Square className="h-4 w-4 text-red-300 hover:text-red-200" />
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
