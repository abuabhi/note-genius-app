
import { useState } from 'react';
import { Clock, Play, Pause, BookOpen, Target, FileText, X, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';
import { cn } from '@/lib/utils';

interface UnifiedFloatingTimerProps {
  className?: string;
}

export const UnifiedFloatingTimer = ({ className = "" }: UnifiedFloatingTimerProps) => {
  const {
    isActive,
    elapsedSeconds,
    currentActivity,
    isPaused,
    isOnStudyPage,
    togglePause,
    recordActivity,
    endSession
  } = useBasicSessionTracker();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show timer if there's an active session, regardless of page
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
    switch (currentActivity) {
      case 'flashcard_study':
        return BookOpen;
      case 'quiz_taking':
        return Target;
      case 'note_review':
        return FileText;
      default:
        return Clock;
    }
  };

  // Calculate progress percentage (max 2 hours = 120 minutes)
  const maxMinutes = 120;
  const currentMinutes = Math.floor(elapsedSeconds / 60);
  const percentage = Math.min((currentMinutes / maxMinutes) * 100, 100);
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ActivityIcon = getActivityIcon();

  const handleTogglePause = () => {
    recordActivity();
    togglePause();
  };

  const handleEndSession = () => {
    recordActivity();
    endSession();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Determine theme based on state
  const getSessionTheme = () => {
    if (!isOnStudyPage || isPaused) {
      return {
        background: 'bg-slate-800/95 border-orange-500/60',
        text: 'text-orange-100',
        timeText: 'text-orange-200',
        iconColor: 'text-orange-300',
        progressColor: 'text-orange-400',
        buttonHover: 'hover:bg-orange-500/20',
        animation: ''
      };
    }
    return {
      background: 'bg-slate-900/95 border-mint-500/60',
      text: 'text-mint-100',
      timeText: 'text-mint-200',
      iconColor: 'text-mint-300',
      progressColor: 'text-mint-400',
      buttonHover: 'hover:bg-mint-500/20',
      animation: 'animate-pulse'
    };
  };

  const theme = getSessionTheme();

  if (isMinimized) {
    return (
      <Card 
        className={cn(
          "fixed bottom-4 right-4 z-50 p-3 shadow-xl transition-all duration-200 cursor-pointer backdrop-blur-sm border-2",
          theme.background,
          theme.animation,
          "hover:shadow-2xl hover:scale-105",
          className
        )}
        onClick={handleMinimize}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r={radius}
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className={cn(theme.text, "opacity-30")}
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={cn(theme.progressColor, "transition-all duration-300 ease-in-out")}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ActivityIcon className={cn("h-4 w-4", theme.iconColor)} />
            </div>
          </div>
          <div className={cn("text-sm font-mono font-bold", theme.timeText)}>
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "fixed bottom-4 right-4 z-50 p-3 shadow-xl transition-all duration-200 backdrop-blur-sm border-2",
        theme.background,
        theme.animation,
        "hover:shadow-2xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        {/* Circular Progress with Activity Icon */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className={cn(theme.text, "opacity-30")}
            />
            <circle
              cx="16"
              cy="16"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(theme.progressColor, "transition-all duration-300 ease-in-out")}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <ActivityIcon className={cn("h-4 w-4", theme.iconColor)} />
          </div>
          {!isPaused && isOnStudyPage && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-mint-400 rounded-full animate-ping" />
          )}
        </div>

        {/* Timer Text */}
        <div className="flex flex-col">
          <div className={cn("text-lg font-mono font-bold tracking-wider", theme.timeText)}>
            {formatTime(elapsedSeconds)}
          </div>
          <div className={cn("text-xs font-medium", theme.text)}>
            {!isOnStudyPage ? 'Away from Study' : isPaused ? 'Paused' : 'Active'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePause}
            className={cn(
              "h-8 w-8 p-0 border border-transparent transition-all duration-200",
              theme.buttonHover,
              "hover:border-current/20 hover:scale-110"
            )}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className={cn("h-4 w-4", theme.iconColor)} />
            ) : (
              <Pause className={cn("h-4 w-4", theme.iconColor)} />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndSession}
            className={cn(
              "h-8 w-8 p-0 border border-transparent transition-all duration-200",
              "hover:bg-red-500/20 hover:border-red-500/20 hover:scale-110"
            )}
            title="End Session"
          >
            <Square className="h-4 w-4 text-red-300 hover:text-red-200" />
          </Button>
          
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className={cn(
                "h-8 w-8 p-0 border border-transparent transition-all duration-200",
                theme.buttonHover,
                "hover:border-current/20 hover:scale-110"
              )}
              title="Minimize"
            >
              <X className={cn("h-4 w-4", theme.iconColor)} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
