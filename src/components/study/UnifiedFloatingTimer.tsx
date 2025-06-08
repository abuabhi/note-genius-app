
import { useState, useEffect } from 'react';
import { Clock, Play, Pause, BookOpen, Target, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const getActivityLabel = () => {
    switch (currentActivity) {
      case 'flashcard_study':
        return 'Flashcards';
      case 'quiz_taking':
        return 'Quiz';
      case 'note_review':
        return 'Notes';
      default:
        return 'Study';
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
  const radius = 16;
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
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-white/30"
              />
              <circle
                cx="20"
                cy="20"
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
    <Card className={`fixed bottom-4 right-4 z-50 p-4 shadow-lg transition-all duration-200 ${getActivityColor()} ${className}`}>
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full animate-pulse ${isPaused ? 'bg-yellow-300' : 'bg-green-300'}`} />
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
              {getActivityLabel()}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="h-6 w-6 p-0 hover:bg-white/20 text-white hover:text-white"
              title="Minimize"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Main Timer Display */}
        <div className="flex items-center gap-4">
          {/* Circular Progress */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                className="text-white/30"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-white transition-all duration-300 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ActivityIcon className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Timer Text and Status */}
          <div className="flex flex-col">
            <div className={`text-lg font-mono font-bold text-white ${isPaused ? 'opacity-70' : ''}`}>
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-xs text-white/80">
              {isPaused ? 'Paused' : 'Active Session'}
            </div>
            {elapsedSeconds >= 1800 && ( // 30+ minutes
              <div className="text-xs text-green-200 font-medium">
                🔥 Great focus!
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePause}
            className="flex-1 h-8 hover:bg-white/20 text-white hover:text-white text-xs"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndSession}
            className="flex-1 h-8 hover:bg-white/20 text-white hover:text-white text-xs"
          >
            End Session
          </Button>
        </div>
      </div>
    </Card>
  );
};
