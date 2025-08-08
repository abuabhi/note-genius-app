import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, Square, GripVertical, AlertTriangle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

export const FloatingSessionTimer = () => {
  const {
    isActive,
    elapsedSeconds,
    isPaused,
    currentTitle,
    currentSubject,
    showInactivityWarning,
    togglePause,
    endSession,
    trackActivity,
    isRecovering
  } = useUnifiedSessionTracker();

  // Debug logging
  console.log('🔍 [FLOATING TIMER DEBUG]', {
    isActive,
    isRecovering,
    elapsedSeconds,
    currentTitle,
    currentSubject,
    isPaused,
    showInactivityWarning
  });

  // Get default bottom-left position
  const getDefaultPosition = useCallback((): Position => {
    const timerHeight = 180; // Approximate timer height
    return {
      x: 20,
      y: window.innerHeight - timerHeight - 20
    };
  }, []);

  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('floating-timer-position');
    return saved ? JSON.parse(saved) : getDefaultPosition();
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('floating-timer-position', JSON.stringify(position));
  }, [position]);

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Strip "Study Plan: " prefix if present
  const getDisplayTitle = (title: string | null): string => {
    if (!title) return 'Study Session';
    return title.replace(/^Study Plan:\s*/, '');
  };

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!timerRef.current) return;
    
    const rect = timerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    trackActivity();
  }, [trackActivity]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 320; // Timer width ~320px
    const maxY = window.innerHeight - 140; // Timer height ~140px
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleEndSession = () => {
    const confirmed = window.confirm('Are you sure you want to end this session?');
    if (confirmed) {
      endSession('Manual session end from floating timer');
    }
  };

  const resetPosition = () => {
    const defaultPos = getDefaultPosition();
    setPosition(defaultPos);
  };

  // Don't render if no active session or still recovering
  if (!isActive || isRecovering) {
    return null;
  }

  return (
    <Card
      ref={timerRef}
      className={cn(
        "fixed z-50 w-80 bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-2xl border-0 transition-all duration-300",
        isDragging ? "scale-105 shadow-3xl" : "hover:shadow-3xl"
      )}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Drag Handle */}
      <div 
        className="flex items-center justify-between p-3 border-b border-white/20"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-white/70" />
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Study Session</span>
        </div>
        {showInactivityWarning && (
          <AlertTriangle className="h-4 w-4 text-yellow-300 animate-pulse" />
        )}
      </div>

      {/* Timer Content */}
      <div className="p-4 space-y-3">
        {/* Time Display */}
        <div className="text-center">
          <div className="text-3xl font-bold font-mono tracking-wider text-white drop-shadow-lg">
            {formatTime(elapsedSeconds)}
          </div>
          {isPaused && (
            <div className="text-sm text-white/80 mt-1">⏸️ Paused</div>
          )}
        </div>

        {/* Session Info */}
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-white/90 truncate">
            {getDisplayTitle(currentTitle)}
          </div>
          {currentSubject && (
            <div className="text-xs text-white/70">
              {currentSubject}
            </div>
          )}
        </div>

        {/* Inactivity Warning */}
        {showInactivityWarning && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded p-2 text-center">
            <div className="text-xs text-yellow-100">
              ⚠️ Session paused due to inactivity
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={togglePause}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 px-3"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={resetPosition}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 px-3"
            title="Reset to default position"
          >
            <Home className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEndSession}
            className="bg-red-500/80 hover:bg-red-600 text-white border-0 h-8 px-3"
          >
            <Square className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
