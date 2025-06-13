
import { useState } from 'react';
import { Clock, Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const SessionDock = () => {
  const {
    isActive,
    elapsedSeconds,
    isPaused,
    togglePause,
    isOnStudyPage,
    showTimeoutWarning,
    dismissTimeoutWarning
  } = useBasicSessionTracker();

  console.log('🎛️ SessionDock render:', { 
    isActive, 
    isPaused, 
    isOnStudyPage, 
    elapsedSeconds,
    showTimeoutWarning,
    showDock: isActive 
  });

  // Show dock ONLY if there's an active session
  if (!isActive) {
    console.log('🎛️ SessionDock hidden - no active session');
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

  const getSessionStatus = () => {
    if (showTimeoutWarning) {
      return 'Timeout Warning!';
    }
    if (!isOnStudyPage) {
      return 'Away from Study';
    }
    if (isPaused) {
      return 'Paused';
    }
    return 'Active Session';
  };

  const getSessionTheme = () => {
    if (showTimeoutWarning) {
      return {
        background: 'bg-red-900/90 border-red-400/60',
        text: 'text-red-100',
        timeText: 'text-red-200',
        iconColor: 'text-red-300',
        buttonHover: 'hover:bg-red-500/15',
        indicator: 'bg-red-400 animate-pulse'
      };
    }
    
    if (!isOnStudyPage || isPaused) {
      return {
        background: 'bg-slate-800/90 border-orange-400/40',
        text: 'text-orange-100',
        timeText: 'text-orange-200',
        iconColor: 'text-orange-300',
        buttonHover: 'hover:bg-orange-500/15',
        indicator: 'bg-orange-400'
      };
    }
    
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

  console.log('🎛️ SessionDock showing with theme:', theme.background);

  return (
    <>
      {/* Timeout Warning Banner */}
      {showTimeoutWarning && (
        <Card className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/95 border-red-400/60 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="text-red-100 text-sm font-medium">
              ⚠️ Session will auto-end in 5 minutes due to inactivity
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissTimeoutWarning}
              className="h-6 w-6 p-0 text-red-300 hover:text-red-100 hover:bg-red-500/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}

      {/* Main Session Dock */}
      <Card className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-xl backdrop-blur-sm border transition-all duration-300",
        theme.background,
        "hover:shadow-2xl"
      )}>
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Clock className={cn("h-4 w-4", theme.iconColor)} />
              {!isPaused && isOnStudyPage && !showTimeoutWarning && (
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse",
                  theme.indicator,
                  "opacity-75"
                )} />
              )}
              {(!isOnStudyPage || showTimeoutWarning) && (
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                  theme.indicator,
                  showTimeoutWarning ? "animate-pulse" : "opacity-60"
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
          </div>
        </div>
      </Card>
    </>
  );
};
