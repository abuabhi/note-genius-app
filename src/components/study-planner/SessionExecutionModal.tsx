
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { StudyPlanSession } from '@/types/studyPlanner';
import { Clock, Play, Square, CheckCircle, Coffee, Star } from 'lucide-react';
import { format } from 'date-fns';

interface SessionExecutionModalProps {
  session: StudyPlanSession | null;
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (sessionId: string) => Promise<void>;
  onCompleteSession: (params: { sessionId: string; notes?: string; rating?: number }) => Promise<void>;
  isStarting?: boolean;
  isCompleting?: boolean;
}

export const SessionExecutionModal = ({
  session,
  isOpen,
  onClose,
  onStartSession,
  onCompleteSession,
  isStarting,
  isCompleting,
}: SessionExecutionModalProps) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  useEffect(() => {
    if (!session) return;
    
    if (session.status === 'in_progress') {
      setIsTimerRunning(true);
      setShowCompletionForm(false);
    } else if (session.status === 'completed') {
      setShowCompletionForm(true);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
      setShowCompletionForm(false);
    }
    
    // Reset form when session changes
    setNotes('');
    setRating(null);
    setSessionTime(0);
    setBreakTime(0);
    setIsOnBreak(false);
  }, [session]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && !isOnBreak) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else if (isTimerRunning && isOnBreak) {
      interval = setInterval(() => {
        setBreakTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, isOnBreak]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    if (!session) return;
    await onStartSession(session.id);
    setIsTimerRunning(true);
  };

  const handleTakeBreak = () => {
    setIsOnBreak(true);
  };

  const handleResumeFromBreak = () => {
    setIsOnBreak(false);
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    
    await onCompleteSession({
      sessionId: session.id,
      notes: notes.trim() || undefined,
      rating: rating || undefined,
    });
    
    setIsTimerRunning(false);
    setShowCompletionForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{session.title}</span>
            <Badge className={getStatusColor(session.status)}>
              {session.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Date:</span> {format(new Date(session.scheduled_date), 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="font-medium">Time:</span> {session.scheduled_start_time} - {session.scheduled_end_time}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {session.duration_minutes} minutes
              </div>
              <div>
                <span className="font-medium">Priority:</span> 
                <Badge variant="outline" className="ml-2">{session.priority}</Badge>
              </div>
            </div>
            {session.topic && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Topic:</span> {session.topic}
              </div>
            )}
            {session.description && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Description:</span> {session.description}
              </div>
            )}
          </div>

          {/* Timer Display */}
          {(session.status === 'in_progress' || isTimerRunning) && (
            <div className="bg-mint-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Clock className="h-8 w-8 text-mint-600" />
                <div className="text-3xl font-bold text-mint-700">
                  {formatTime(sessionTime)}
                </div>
              </div>
              
              {isOnBreak && (
                <div className="flex items-center justify-center gap-2 mb-4 text-orange-600">
                  <Coffee className="h-5 w-5" />
                  <span>Break Time: {formatTime(breakTime)}</span>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {!isOnBreak ? (
                  <>
                    <Button onClick={handleTakeBreak} variant="outline">
                      <Coffee className="h-4 w-4 mr-2" />
                      Take Break
                    </Button>
                    <Button 
                      onClick={handleCompleteSession}
                      disabled={isCompleting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Session
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleResumeFromBreak}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Session
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Start Session */}
          {session.status === 'scheduled' && (
            <div className="text-center">
              <Button 
                onClick={handleStartSession}
                disabled={isStarting}
                size="lg"
                className="bg-mint-600 hover:bg-mint-700"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Session
              </Button>
            </div>
          )}

          {/* Completion Form */}
          {(session.status === 'completed' || showCompletionForm) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Session Complete!</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Session Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did the session go? Any key insights or challenges?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rate Your Performance</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${
                        rating && star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {session.status !== 'completed' && (
                <Button 
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Save & Complete Session
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
