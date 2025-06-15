
import { useState } from 'react';
import { Clock, Play, Pause, X, BookOpen, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRealSessionTracker } from '@/hooks/useRealSessionTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const RealSessionDock = () => {
  const {
    isActive,
    elapsedSeconds,
    activityType,
    endSession
  } = useRealSessionTracker();

  console.log('🎛️ RealSessionDock render:', { 
    isActive, 
    activityType,
    elapsedSeconds,
    showDock: isActive 
  });

  // Show dock ONLY if there's an active session
  if (!isActive) {
    console.log('🎛️ RealSessionDock hidden - no active session');
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
        return <BookOpen className="h-4 w-4 text-mint-300" />;
      case 'note_review':
        return <Brain className="h-4 w-4 text-blue-300" />;
      case 'quiz_taking':
        return <Brain className="h-4 w-4 text-purple-300" />;
      default:
        return <Clock className="h-4 w-4 text-mint-300" />;
    }
  };

  const getActivityLabel = () => {
    switch (activityType) {
      case 'flashcard_study':
        return 'Studying Flashcards';
      case 'note_review':
        return 'Reviewing Notes';
      case 'quiz_taking':
        return 'Taking Quiz';
      default:
        return 'Study Session';
    }
  };

  const handleEndSession = () => {
    endSession();
  };

  console.log('🎛️ RealSessionDock showing active session');

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-xl backdrop-blur-sm border bg-slate-800/90 border-mint-400/40 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {getActivityIcon()}
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse opacity-75" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-mono font-semibold tracking-wide text-mint-200">
              {formatTime(elapsedSeconds)}
            </span>
            <span className="text-xs font-medium text-mint-100">
              {getActivityLabel()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-1.5 ml-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEndSession}
                  className="h-9 w-9 p-0 border border-transparent transition-all duration-200 hover:bg-red-500/15 hover:border-red-400/20 hover:scale-105"
                >
                  <X className="h-4 w-4 text-red-300 hover:text-red-200" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-600">
                End Session
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};
