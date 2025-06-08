
import { useState, useEffect } from 'react';
import { Clock, Play, Pause, BookOpen, Target, FileText, X, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';

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
  } = useGlobalSessionTracker();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't show timer if not on study page or no active session
  if (!isOnStudyPage || !isActive) {
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

  const getActivityColor = () => {
    switch (currentActivity) {
      case 'flashcard_study':
        return 'bg-mint-500 border-mint-600 hover:bg-mint-600';
      case 'quiz_taking':
        return 'bg-purple-500 border-purple-600 hover:bg-purple-600';
      case 'note_review':
        return 'bg-blue-500 border-blue-600 hover:bg-blue-600';
      default:
        return 'bg-gray-500 border-gray-600 hover:bg-gray-600';
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

  if (isMinimized) {
    return (
      <Card 
        className={`fixed bottom-4 right-4 z-50 p-2 shadow-lg transition-all duration-200 cursor-pointer ${getActivityColor()} ${className}`}
        onClick={handleMinimize}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r={radius}
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-white/30"
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
                className="text-white transition-all duration-300 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ActivityIcon className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="text-xs font-mono font-medium text-white">
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`fixed bottom-4 right-4 z-50 p-3 shadow-lg transition-all duration-200 ${getActivityColor()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
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
              className="text-white/30"
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
              className="text-white transition-all duration-300 ease-in-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <ActivityIcon className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Timer Text */}
        <div className={`text-sm font-mono font-bold text-white ${isPaused ? 'opacity-70' : ''}`}>
          {formatTime(elapsedSeconds)}
        </div>

        {/* Controls */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePause}
            className="h-7 w-7 p-0 hover:bg-white/20 text-white hover:text-white"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndSession}
            className="h-7 w-7 p-0 hover:bg-white/20 text-white hover:text-white"
            title="End Session"
          >
            <Square className="h-3 w-3" />
          </Button>
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="h-7 w-7 p-0 hover:bg-white/20 text-white hover:text-white"
              title="Minimize"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
