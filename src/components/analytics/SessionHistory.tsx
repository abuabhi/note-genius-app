
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, BookOpen, Target } from 'lucide-react';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { format } from 'date-fns';

export const SessionHistory = () => {
  const { sessions, isLoading } = useSessionAnalytics();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSessionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedSessions = sessions.filter(session => !session.is_active && session.duration);

  if (completedSessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Sessions Yet</h3>
          <p className="text-gray-500">
            Your study sessions will appear here once you start studying with SessionDock.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-lg font-semibold">{completedSessions.length}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-lg font-semibold">
                  {formatDuration(completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-lg font-semibold">
                  {completedSessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Cards Reviewed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-lg font-semibold">
                  {Math.round(completedSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / completedSessions.length / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Avg Session</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSessions.slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{session.title || 'Study Session'}</h4>
                    <Badge className={getSessionQualityColor(session.session_quality || 'good')}>
                      {session.session_quality || 'Good'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.start_time), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(session.duration || 0)}
                    </span>
                    {session.cards_reviewed && session.cards_reviewed > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {session.cards_reviewed} cards
                      </span>
                    )}
                  </div>
                  
                  {session.subject && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {session.subject}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">
                    {format(new Date(session.start_time), 'h:mm a')}
                  </div>
                  {session.cards_correct && session.cards_reviewed && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round((session.cards_correct / session.cards_reviewed) * 100)}% accuracy
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
