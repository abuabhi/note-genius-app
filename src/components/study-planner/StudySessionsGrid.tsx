
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlanSession } from '@/types/studyPlanner';
import { Calendar, Clock, Play, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface StudySessionsGridProps {
  sessions: StudyPlanSession[];
  onStartSession: (sessionId: string) => Promise<void>;
  onCompleteSession: (params: { sessionId: string; notes?: string; rating?: number }) => Promise<void>;
  onRescheduleSession: (params: { sessionId: string; newDate: string; newStartTime: string; newEndTime: string }) => Promise<void>;
  isStarting?: boolean;
  isCompleting?: boolean;
}

export const StudySessionsGrid = ({
  sessions,
  onStartSession,
  onCompleteSession,
  onRescheduleSession,
  isStarting,
  isCompleting,
}: StudySessionsGridProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    await onCompleteSession({ sessionId });
  };

  const handleRescheduleSession = async (sessionId: string) => {
    // For now, reschedule to tomorrow at the same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      await onRescheduleSession({
        sessionId,
        newDate: tomorrow.toISOString().split('T')[0],
        newStartTime: session.scheduled_start_time,
        newEndTime: session.scheduled_end_time,
      });
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Generated</h3>
        <p className="text-gray-600">Generate sessions from your study plans to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <Card key={session.id} className={`border-l-4 ${getPriorityColor(session.priority)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold">{session.title}</CardTitle>
              <Badge className={getStatusColor(session.status)}>
                {session.status.replace('_', ' ')}
              </Badge>
            </div>
            {session.topic && (
              <p className="text-sm text-gray-600">{session.topic}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(session.scheduled_date), 'MMM dd, yyyy')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {session.scheduled_start_time} - {session.scheduled_end_time}
                <span className="ml-2 text-xs">
                  ({session.duration_minutes} min)
                </span>
              </span>
            </div>

            {session.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
            )}

            <div className="flex gap-2 pt-2">
              {session.status === 'scheduled' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onStartSession(session.id)}
                    disabled={isStarting}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRescheduleSession(session.id)}
                    className="flex-1"
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Reschedule
                  </Button>
                </>
              )}
              
              {session.status === 'in_progress' && (
                <Button
                  size="sm"
                  onClick={() => handleCompleteSession(session.id)}
                  disabled={isCompleting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}

              {session.status === 'completed' && session.performance_rating && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < session.performance_rating! ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
