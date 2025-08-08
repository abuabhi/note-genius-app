
import React from 'react';
import { Clock, Play, Pause, X, BookOpen, Brain, FileText, Calendar, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  isCollapsed: boolean;
  hideIcon?: boolean;
  hideSubject?: boolean;
  stripStudyPlanPrefix?: boolean;
  emphasizeTime?: boolean;
}

export const SessionTimer = ({ isCollapsed, hideIcon = false, hideSubject = false, stripStudyPlanPrefix = false, emphasizeTime = false }: SessionTimerProps) => {
  const {
    isActive,
    elapsedSeconds,
    isPaused,
    activityType,
    showInactivityWarning,
    currentTitle,
    currentSubject,
    isRecovering,
    togglePause,
    endSession,
    dismissInactivityWarning
  } = useUnifiedSessionTracker();

  // Debug logging to see what's happening with the session state
  console.log('🔧 [SESSION TIMER] Component state:', {
    isActive,
    isRecovering,
    elapsedSeconds,
    currentTitle,
    activityType,
    currentSubject
  });

  // Show loading state during recovery
  if (isRecovering) {
    return (
      <div className="bg-white border border-blue-200 rounded-xl shadow-lg p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <Loader className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <>
              <Loader className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-800 font-medium">Loading session...</span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Don't show if no active session
  if (!isActive) {
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

  const getSessionTheme = () => {
    if (showInactivityWarning) {
      return {
        background: 'bg-destructive/10 border-destructive/30',
        text: 'text-destructive',
        timeText: 'text-destructive',
        iconColor: 'text-destructive',
        indicator: 'bg-destructive'
      };
    }

    if (isPaused) {
      return {
        background: 'bg-muted/50 border-border',
        text: 'text-muted-foreground',
        timeText: 'text-foreground',
        iconColor: 'text-muted-foreground',
        indicator: 'bg-muted-foreground'
      };
    }

    return {
      background: 'bg-primary/5 border-primary/20',
      text: 'text-foreground',
      timeText: 'text-primary',
      iconColor: 'text-primary',
      indicator: 'bg-primary'
    };
  };

const theme = getSessionTheme();
  const titleToShow = currentTitle ? (stripStudyPlanPrefix ? currentTitle.replace(/^Study Plan:\s*/i, '') : currentTitle) : 'Study Session';

  const handleEndSession = () => {
    const confirmEnd = window.confirm('Are you sure you want to end this study session?');
    if (confirmEnd) {
      endSession('Manual session end via sidebar timer');
    }
  };

  if (isCollapsed) {
    // Collapsed state - enhanced minimal indicator
    return (
      <div className={cn(
        "bg-background border border-border rounded-md shadow-md p-2 backdrop-blur-sm ring-1 ring-primary/10 transition-all duration-300",
        theme.background
      )}>
        <div className="flex flex-col items-center gap-2">
          {!hideIcon && (
            <div className="relative">
              <div className={cn("h-5 w-5", theme.iconColor)}>
                {getActivityIcon()}
              </div>
              {!isPaused && (
                <div className={cn(
                  "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse",
                  theme.indicator
                )} />
              )}
            </div>
          )}
          <span className={cn(
            emphasizeTime ? "text-base sm:text-lg font-mono font-bold" : "text-sm font-mono font-bold",
            theme.timeText
          )}>
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>
    );
  }

  // Expanded state - enhanced full timer
  return (
    <div className={cn(
      "bg-background border border-border rounded-md shadow-md ring-1 ring-primary/10 px-3 py-2 backdrop-blur-sm transition-all duration-300 min-w-64",
      theme.background
    )}>
      {/* Inactivity Warning - compact */}
      {showInactivityWarning && (
        <div className="mb-2 px-2 py-1 rounded-sm border border-destructive/30 bg-destructive/10 text-[11px] text-destructive flex items-center justify-between">
          <span className="leading-snug">Session inactive — auto-stop soon.</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissInactivityWarning}
            className="h-6 w-6 text-destructive hover:text-destructive"
            aria-label="Dismiss inactivity warning"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Compact single-row bar */}
      <div className="flex items-center gap-3">
        {/* Status */}
        <div className="flex items-center gap-2">
          {!isPaused && !showInactivityWarning && <span className={cn("inline-block h-2 w-2 rounded-full animate-pulse", theme.indicator)} />}
          {(isPaused || showInactivityWarning) && <span className={cn("inline-block h-2 w-2 rounded-full", theme.indicator)} />}
          <span className={cn("text-xs", theme.text)}>{isPaused ? 'Paused' : showInactivityWarning ? 'Inactive' : 'Active Session'}</span>
        </div>

        <span className="h-4 w-px bg-border" />

        {/* Timer */}
        <div className={cn(emphasizeTime ? "text-base sm:text-lg md:text-xl font-mono font-bold" : "text-sm font-mono font-semibold", theme.timeText)}>
          {formatTime(elapsedSeconds)}
        </div>

        <span className="h-4 w-px bg-border" />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className={cn("truncate text-sm", theme.text)} title={titleToShow}>
            {titleToShow}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePause}
            className="h-7 w-7"
            aria-label={isPaused ? 'Resume session' : 'Pause session'}
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEndSession}
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label="End session"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
