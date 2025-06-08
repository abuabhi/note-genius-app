
import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CompactFloatingTimerProps {
  activityType: 'flashcard' | 'quiz' | 'note';
  isActive?: boolean;
  onTogglePause?: () => void;
  triggerStudyActivity?: boolean;
  className?: string;
}

export const CompactFloatingTimer = ({ 
  activityType, 
  isActive = false, 
  onTogglePause,
  triggerStudyActivity = false,
  className = ""
}: CompactFloatingTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [internalActive, setInternalActive] = useState(triggerStudyActivity || isActive);

  useEffect(() => {
    if (triggerStudyActivity) {
      setInternalActive(true);
    }
  }, [triggerStudyActivity]);

  useEffect(() => {
    setInternalActive(isActive);
  }, [isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (internalActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!internalActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [internalActive, seconds]);

  const reset = () => {
    setSeconds(0);
    setInternalActive(false);
  };

  const toggle = () => {
    const newState = !internalActive;
    setInternalActive(newState);
    onTogglePause?.();
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate percentage for progress (max 60 minutes)
  const maxMinutes = 60;
  const currentMinutes = Math.floor(seconds / 60);
  const percentage = Math.min((currentMinutes / maxMinutes) * 100, 100);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getActivityLabel = () => {
    switch (activityType) {
      case 'flashcard':
        return 'Flashcards';
      case 'quiz':
        return 'Quiz';
      case 'note':
        return 'Notes';
      default:
        return 'Study Session';
    }
  };

  return (
    <Card className={`fixed top-4 right-4 z-40 p-3 bg-white/95 backdrop-blur-sm border-mint-200 shadow-lg ${className}`}>
      <div className="flex items-center gap-3">
        {/* Compact Circular Progress */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-mint-100"
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
              className="text-mint-500 transition-all duration-300 ease-in-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="h-4 w-4 text-mint-600" />
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col">
          <div className="text-sm font-mono font-medium text-gray-900">
            {formatTime(seconds)}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-24">
            {getActivityLabel()}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="h-7 w-7 p-0 hover:bg-mint-50"
          >
            {internalActive ? (
              <Pause className="h-3 w-3 text-mint-600" />
            ) : (
              <Play className="h-3 w-3 text-mint-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-7 w-7 p-0 hover:bg-mint-50"
          >
            <RotateCcw className="h-3 w-3 text-mint-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
