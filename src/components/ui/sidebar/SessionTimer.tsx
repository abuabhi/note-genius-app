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
export const SessionTimer = ({
  isCollapsed,
  hideIcon = false,
  hideSubject = false,
  stripStudyPlanPrefix = false,
  emphasizeTime = false
}: SessionTimerProps) => {
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
    endSession
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
    return <div className="relative overflow-hidden bg-gradient-to-r from-success to-primary border border-white/10 rounded-xl shadow-lg p-3 backdrop-blur-sm ring-1 ring-white/10">
        <div className="flex items-center gap-2">
          <Loader className="h-4 w-4 text-white animate-spin" />
          {!isCollapsed && <span className="text-base text-white font-medium">Loading session...</span>}
        </div>
      </div>;
  }

  // Don't show if no active session
  if (!isActive) {
    return null;
  }
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
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
    return {
      background: 'border-transparent',
      text: 'text-white',
      timeText: 'text-white',
      iconColor: 'text-white',
      indicator: 'bg-white'
    };
  };
  const theme = getSessionTheme();
  const titleToShow = currentTitle ? stripStudyPlanPrefix ? currentTitle.replace(/^Study Plan:\s*/i, '') : currentTitle : 'Study Session';
  const handleEndSession = () => {
    const confirmEnd = window.confirm('Are you sure you want to end this study session?');
    if (confirmEnd) {
      endSession('Manual session end via sidebar timer');
    }
  };
  if (isCollapsed) {
    // Collapsed state - enhanced minimal indicator
    return <div className={cn("relative overflow-hidden bg-gradient-to-r from-success to-primary border border-white/10 rounded-xl shadow-lg p-3 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-300", theme.background)}>
        <div className="flex flex-col items-center gap-2">
          {!hideIcon && <div className="relative">
              <div className={cn("h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/30 flex items-center justify-center", theme.iconColor)}>
                {getActivityIcon()}
              </div>
              {!isPaused && <div className={cn("absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse", theme.indicator)} />}
            </div>}
          <span className={cn("text-lg font-mono font-extrabold tracking-tight text-white drop-shadow-sm")}>
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>;
  }

  // Expanded state - enhanced full timer
  return <div className={cn("relative overflow-hidden bg-gradient-to-r from-success to-primary border border-white/10 rounded-xl shadow-lg ring-1 ring-white/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 min-w-72 min-h-14 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-white/40", theme.background)}>
      {/* Inactivity Warning - compact */}
      {showInactivityWarning && <div className="mb-2 px-2 py-1 rounded-sm border border-white/20 bg-white/10 text-xs md:text-sm text-white">
          Auto pause protection: you're inactive — session will auto-pause soon.
        </div>}

      {/* Compact single-row bar */}
      <div className="flex items-center gap-3">
        {/* Status */}
        <div className="flex items-center gap-2">
          {!isPaused && !showInactivityWarning && <span className={cn("inline-block h-2 w-2 rounded-full animate-pulse", theme.indicator)} />}
          {(isPaused || showInactivityWarning) && <span className={cn("inline-block h-2 w-2 rounded-full", theme.indicator)} />}
          <span className="text-sm md:text-base font-semibold text-white">{isPaused ? 'Paused' : showInactivityWarning ? 'Inactive' : 'Active Session'}</span>
        </div>

        <span className="h-4 w-px bg-border" />

        {/* Timer */}
        <div className="text-lg md:text-xl font-mono font-extrabold tracking-tight text-white drop-shadow-sm bg-success/90 px-2 py-0.5 rounded-md">
          {formatTime(elapsedSeconds)}
        </div>

        <span className="h-4 w-px bg-border" />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm md:text-base font-medium text-white" title={titleToShow}>
            {titleToShow}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={togglePause} className="h-7 w-7 text-white hover:bg-white/10" aria-label={isPaused ? 'Resume session' : 'Pause session'}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleEndSession} className="h-7 w-7 text-white hover:bg-white/10" aria-label="End session">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>;
};