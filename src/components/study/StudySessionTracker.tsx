
import { useEffect } from 'react';
import { useStudySessionTracking } from '@/hooks/useStudySessionTracking';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen } from 'lucide-react';

interface StudySessionTrackerProps {
  flashcardSetId: string;
  flashcardSetName: string;
  cardsStudied: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export const StudySessionTracker = ({ 
  flashcardSetId, 
  flashcardSetName, 
  cardsStudied,
  onSessionStart,
  onSessionEnd 
}: StudySessionTrackerProps) => {
  const { 
    currentSession, 
    startStudySession, 
    endStudySession, 
    updateCardsStudied,
    isSessionActive 
  } = useStudySessionTracking();

  // Start session when component mounts
  useEffect(() => {
    if (!isSessionActive && flashcardSetId && flashcardSetName) {
      startStudySession(flashcardSetId, flashcardSetName).then(() => {
        onSessionStart?.();
      });
    }

    // End session when component unmounts
    return () => {
      if (isSessionActive) {
        endStudySession(cardsStudied).then(() => {
          onSessionEnd?.();
        });
      }
    };
  }, []);

  // Update cards studied count
  useEffect(() => {
    if (isSessionActive) {
      updateCardsStudied(cardsStudied);
    }
  }, [cardsStudied, isSessionActive, updateCardsStudied]);

  if (!currentSession) {
    return null;
  }

  const sessionDuration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000 / 60);

  return (
    <Card className="border-mint-200 bg-mint-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-mint-800">Study Session Active</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white">
              <Clock className="h-3 w-3 mr-1" />
              {sessionDuration}m
            </Badge>
            <Badge variant="outline" className="bg-white">
              <BookOpen className="h-3 w-3 mr-1" />
              {cardsStudied} cards
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
