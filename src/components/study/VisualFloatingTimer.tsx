import { useEffect, useState } from 'react';
import { useGlobalSessionTracker } from '@/hooks/useGlobalSessionTracker';
import { isStudyRoute } from '@/hooks/useGlobalSessionTracker/types';
import { useLocation } from 'react-router-dom';
import { Clock, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VisualFloatingTimer = () => {
  const location = useLocation();
  const { 
    isActive, 
    elapsedSeconds, 
    isPaused,
    togglePause 
  } = useGlobalSessionTracker();
  
  const [displayTime, setDisplayTime] = useState('00:00');
  const isOnStudyPage = isStudyRoute(location.pathname);

  // Update display time
  useEffect(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    setDisplayTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [elapsedSeconds]);

  // Don't show timer if not active and not on study page
  if (!isActive && !isOnStudyPage) {
    return null;
  }

  const getBackgroundColor = () => {
    if (isActive && isOnStudyPage) {
      return isPaused ? 'bg-orange-500/20' : 'bg-red-500/20';
    }
    return 'bg-gray-500/20';
  };

  const getBorderColor = () => {
    if (isActive && isOnStudyPage) {
      return isPaused ? 'border-orange-500/40' : 'border-red-500/40';
    }
    return 'border-gray-500/40';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${getBackgroundColor()} ${getBorderColor()} border backdrop-blur-sm rounded-lg p-3 shadow-lg transition-all duration-300`}>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        <span className="font-mono font-medium">{displayTime}</span>
        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
            className="h-6 w-6 p-0"
          >
            {isPaused ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      {isActive && (
        <div className="text-xs text-muted-foreground mt-1">
          {isPaused ? 'Paused' : 'Study Session'}
        </div>
      )}
    </div>
  );
};
