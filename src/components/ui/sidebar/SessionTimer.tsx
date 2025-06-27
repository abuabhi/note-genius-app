
import React from 'react';
import { Clock, Play, Pause, X, BookOpen, Brain, FileText, Calendar, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  isCollapsed: boolean;
}

export const SessionTimer = ({ isCollapsed }: SessionTimerProps) => {
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

  // Show loading state during recovery
  if (isRecovering) {
    return (
      <div className="mx-2 mb-2 p-2 rounded-lg border bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <Loader className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <>
              <Loader className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-800">Loading session...</span>
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
        background: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        timeText: 'text-red-900',
        iconColor: 'text-red-600',
        indicator: 'bg-red-500'
      };
    }
    
    if (isPaused) {
      return {
        background: 'bg-orange-50 border-orange-200',
        text: 'text-orange-800',
        timeText: 'text-orange-900',
        iconColor: 'text-orange-600',
        indicator: 'bg-orange-500'
      };
    }
    
    return {
      background: 'bg-mint-50 border-mint-200',
      text: 'text-mint-800',
      timeText: 'text-mint-900',
      iconColor: 'text-mint-600',
      indicator: 'bg-mint-500'
    };
  };

  const theme = getSessionTheme();

  const handleEndSession = () => {
    const confirmEnd = window.confirm('Are you sure you want to end this study session?');
    if (confirmEnd) {
      endSession('Manual session end via sidebar timer');
    }
  };

  if (isCollapsed) {
    // Collapsed state - show minimal indicator
    return (
      <div className={cn(
        "mx-2 mb-2 p-2 rounded-lg border transition-all duration-200",
        theme.background
      )}>
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            {getActivityIcon()}
            {!isPaused && (
              <div className={cn(
                "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse",
                theme.indicator
              )} />
            )}
          </div>
          <span className={cn("text-xs font-mono font-semibold", theme.timeText)}>
            {formatTime(elapsedSeconds)}
          </span>
        </div>
      </div>
    );
  }

  // Expanded state - show full timer
  return (
    <div className={cn(
      "mx-3 mb-3 p-3 rounded-lg border transition-all duration-200",
      theme.background
    )}>
      {/* Inactivity Warning */}
      {showInactivityWarning && (
        <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
          <div className="flex items-center gap-2">
            <span>⚠️ Session will auto-stop in 2 minutes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissInactivityWarning}
              className="h-4 w-4 p-0 text-red-600 hover:text-red-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className={cn("h-5 w-5", theme.iconColor)}>
            {getActivityIcon()}
          </div>
          {!isPaused && !showInactivityWarning && (
            <div className={cn(
              "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse",
              theme.indicator
            )} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-lg font-mono font-bold", theme.timeText)}>
            {formatTime(elapsedSeconds)}
          </div>
          <div className={cn("text-xs", theme.text)}>
            {isPaused ? 'Paused' : showInactivityWarning ? 'Inactive' : 'Active Session'}
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="mb-3">
        <div className={cn("text-sm font-medium truncate", theme.text)}>
          {currentTitle || 'Study Session'}
        </div>
        {currentSubject && (
          <div className={cn("text-xs opacity-75 truncate", theme.text)}>
            {currentSubject}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePause}
          className={cn(
            "flex-1 h-8 text-xs",
            "hover:bg-white/50 border-current/20"
          )}
        >
          {isPaused ? (
            <Play className="h-3 w-3 mr-1" />
          ) : (
            <Pause className="h-3 w-3 mr-1" />
          )}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndSession}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
        >
          <X className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    </div>
  );
};
