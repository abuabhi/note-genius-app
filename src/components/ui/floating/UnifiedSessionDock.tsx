
import { Clock, Play, Pause, X, BookOpen, Brain, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const UnifiedSessionDock = () => {
  const {
    isActive,
    elapsedSeconds,
    isPaused,
    activityType,
    isOnStudyPage,
    showTimeoutWarning,
    currentTitle,
    currentSubject,
    togglePause,
    endSession,
    dismissTimeoutWarning
  } = useUnifiedSessionTracker();

  console.log('🎛️ UnifiedSessionDock render:', { 
    isActive, 
    isPaused, 
    isOnStudyPage, 
    elapsedSeconds,
    showTimeoutWarning,
    activityType,
    currentTitle,
    showDock: isActive 
  });

  // Show dock ONLY if there's an active session
  if (!isActive) {
    console.log('🎛️ UnifiedSessionDock hidden - no active session');
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

  const getActivityIcon = () => {
    switch (activityType) {
      case 'flashcard_study':
        return <BookOpen className="h-4 w-4" />;
      case 'note_review':
        return <FileText className="h-4 w-4" />;
      case 'quiz_taking':
        return <Brain className="h-4 w-4" />;
      case 'study_plan':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSessionStatus = () => {
    if (showTimeoutWarning) {
      return 'Timeout Warning!';
    }
    if (!isOnStudyPage && activityType !== 'study_plan') {
      return 'Away from Study';
    }
    if (isPaused) {
      return 'Paused';
    }
    if (activityType === 'study_plan') {
      return 'Study Plan Active';
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
    
    if ((!isOnStudyPage && activityType !== 'study_plan') || isPaused) {
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

  const handleEndSession = () => {
    const confirmEnd = window.confirm('Are you sure you want to end this study session?');
    if (confirmEnd) {
      endSession('Manual session end via floating dock');
    }
  };

  console.log('🎛️ UnifiedSessionDock showing with theme:', theme.background);

  return (
    <>
      {/* Timeout Warning Banner - Top Right */}
      {showTimeoutWarning && (
        <Card className="fixed top-20 right-6 z-40 bg-red-900/95 border-red-400/60 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="text-red-100 text-sm font-medium">
              ⚠️ Session will auto-end in 30 minutes
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

      {/* Main Session Dock - Bottom Right Corner */}
      <Card className={cn(
        "fixed bottom-6 right-6 z-30 shadow-lg backdrop-blur-sm border transition-all duration-300",
        theme.background,
        "hover:shadow-xl"
      )}>
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={cn("h-4 w-4", theme.iconColor)}>
                {getActivityIcon()}
              </div>
              {!isPaused && (isOnStudyPage || activityType === 'study_plan') && !showTimeoutWarning && (
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse",
                  theme.indicator,
                  "opacity-75"
                )} />
              )}
              {((!isOnStudyPage && activityType !== 'study_plan') || showTimeoutWarning) && (
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                  theme.indicator,
                  showTimeoutWarning ? "animate-pulse" : "opacity-60"
                )} />
              )}
            </div>
            <div className="flex flex-col">
              <span className={cn("text-sm font-mono font-semibold tracking-wide", theme.timeText)}>
                {formatTime(elapsedSeconds)}
              </span>
              <span className={cn("text-xs font-medium", theme.text)}>
                {getSessionStatus()}
              </span>
            </div>
          </div>
          
          {/* Session Info */}
          <div className="flex flex-col min-w-0 max-w-32">
            <span className={cn("text-xs font-medium truncate", theme.text)}>
              {currentTitle || 'Study Session'}
            </span>
            {currentSubject && (
              <span className={cn("text-xs opacity-75 truncate", theme.text)}>
                {currentSubject}
              </span>
            )}
          </div>
          
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePause}
                    className={cn(
                      "h-7 w-7 p-0 border border-transparent transition-all duration-200",
                      theme.buttonHover,
                      "hover:border-current/15 hover:scale-105"
                    )}
                  >
                    {isPaused ? (
                      <Play className={cn("h-3 w-3", theme.iconColor)} />
                    ) : (
                      <Pause className={cn("h-3 w-3", theme.iconColor)} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-800 text-white border-slate-600">
                  {isPaused ? 'Resume Session' : 'Pause Session'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndSession}
                    className={cn(
                      "h-7 w-7 p-0 border border-transparent transition-all duration-200",
                      "hover:bg-red-500/15 hover:border-red-400/20 hover:scale-105"
                    )}
                  >
                    <X className="h-3 w-3 text-red-300 hover:text-red-200" />
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
    </>
  );
};
