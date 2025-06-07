
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Brain, Target, Clock, Play, Pause } from 'lucide-react';
import { formatDuration } from '@/utils/formatTime';

interface StudyTimeDonutCounterProps {
  activityType: 'note' | 'flashcard' | 'quiz';
  isActive: boolean;
  startTime?: Date;
  currentSessionTime?: number; // in seconds
  totalStudyTime?: number; // total time across all activities today
  onTogglePause?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ACTIVITY_CONFIG = {
  note: {
    color: '#10b981', // mint-600
    bgColor: '#f0fdf4', // mint-50
    icon: BookOpen,
    label: 'Notes'
  },
  flashcard: {
    color: '#3b82f6', // blue-600
    bgColor: '#eff6ff', // blue-50
    icon: Brain,
    label: 'Flashcards'
  },
  quiz: {
    color: '#8b5cf6', // purple-600
    bgColor: '#f5f3ff', // purple-50
    icon: Target,
    label: 'Quiz'
  }
};

const SIZE_CONFIG = {
  small: { radius: 40, strokeWidth: 6, size: 100 },
  medium: { radius: 60, strokeWidth: 8, size: 140 },
  large: { radius: 80, strokeWidth: 10, size: 180 }
};

export const StudyTimeDonutCounter = ({
  activityType,
  isActive,
  startTime,
  currentSessionTime = 0,
  totalStudyTime = 0,
  onTogglePause,
  className = '',
  size = 'medium'
}: StudyTimeDonutCounterProps) => {
  const [elapsedTime, setElapsedTime] = useState(currentSessionTime);
  const [isPaused, setIsPaused] = useState(false);

  const config = ACTIVITY_CONFIG[activityType];
  const sizeConfig = SIZE_CONFIG[size];
  const ActivityIcon = config.icon;

  // Update elapsed time every second when active
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      if (startTime) {
        const now = Date.now();
        const sessionElapsed = Math.floor((now - startTime.getTime()) / 1000);
        setElapsedTime(sessionElapsed);
      } else {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, isPaused]);

  // Calculate circle properties
  const circumference = 2 * Math.PI * sizeConfig.radius;
  const progressPercentage = Math.min((elapsedTime / 3600) * 100, 100); // Cap at 1 hour for visual purposes
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    onTogglePause?.();
  };

  return (
    <Card className={`p-4 ${className}`} style={{ backgroundColor: config.bgColor }}>
      <div className="flex flex-col items-center space-y-3">
        {/* Donut Chart */}
        <div className="relative" style={{ width: sizeConfig.size, height: sizeConfig.size }}>
          <svg
            width={sizeConfig.size}
            height={sizeConfig.size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={sizeConfig.size / 2}
              cy={sizeConfig.size / 2}
              r={sizeConfig.radius}
              stroke="#e5e7eb"
              strokeWidth={sizeConfig.strokeWidth}
              fill="transparent"
            />
            
            {/* Progress circle */}
            <circle
              cx={sizeConfig.size / 2}
              cy={sizeConfig.size / 2}
              r={sizeConfig.radius}
              stroke={config.color}
              strokeWidth={sizeConfig.strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
              style={{
                filter: isActive && !isPaused ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' : 'none'
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ActivityIcon 
              className="h-6 w-6 mb-1" 
              style={{ color: config.color }}
            />
            <div 
              className="text-lg font-bold"
              style={{ color: config.color }}
            >
              {formatDuration(elapsedTime)}
            </div>
            {size !== 'small' && (
              <div className="text-xs opacity-70" style={{ color: config.color }}>
                {config.label}
              </div>
            )}
          </div>
          
          {/* Active indicator */}
          {isActive && !isPaused && (
            <div 
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse"
              style={{ backgroundColor: config.color }}
            />
          )}
        </div>

        {/* Controls */}
        {isActive && onTogglePause && size !== 'small' && (
          <button
            onClick={handleTogglePause}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors"
            style={{ 
              backgroundColor: config.color,
              color: 'white'
            }}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}

        {/* Session stats */}
        {size === 'large' && totalStudyTime > 0 && (
          <div className="text-xs text-center space-y-1 opacity-80">
            <div className="flex items-center gap-1 justify-center">
              <Clock className="h-3 w-3" />
              <span>Today: {formatDuration(totalStudyTime)}</span>
            </div>
            {elapsedTime >= 900 && ( // Show milestone after 15 minutes
              <div className="text-xs font-medium" style={{ color: config.color }}>
                🎯 Great focus session!
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
