
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Award, BookOpen } from 'lucide-react';
import { useCleanSessionAnalytics } from '@/hooks/useCleanSessionAnalytics';
import { format } from 'date-fns';

export const SessionHistory = () => {
  const { sessions, isLoading } = useCleanSessionAnalytics();

  const getSessionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs_improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'short':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'excessive':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Only show real study sessions (not auto-created ones)
  const realSessions = sessions.filter(session => !session.auto_created);

  if (realSessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Real Study Sessions Yet</h3>
          <p className="text-gray-600 text-center max-w-md">
            Start studying flashcards, reviewing notes, or taking quizzes to see your session history here. 
            Your sessions will be tracked automatically when you engage in study activities!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Study Sessions</h2>
        <Badge variant="outline" className="text-sm">
          {realSessions.length} real sessions
        </Badge>
      </div>
      
      <div className="space-y-4">
        {realSessions.map((session: any) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {session.title || session.subject || 'Study Session'}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSessionQualityColor(session.session_quality || 'good')}`}
                    >
                      {session.session_quality || 'good'}
                    </Badge>
                    {session.activity_type && (
                      <Badge variant="secondary" className="text-xs">
                        {session.activity_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {session.start_time ? format(new Date(session.start_time), 'MMM d, yyyy • h:mm a') : 'Unknown time'}
                    </div>
                    
                    {session.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(session.duration)}
                      </div>
                    )}
                  </div>
                  
                  {session.subject && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {session.subject}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  {session.cards_reviewed > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{session.cards_correct || 0}/{session.cards_reviewed} cards</span>
                    </div>
                  )}
                  
                  {session.cards_reviewed > 0 && (
                    <div className="text-xs text-gray-500">
                      {Math.round(((session.cards_correct || 0) / session.cards_reviewed) * 100)}% accuracy
                    </div>
                  )}
                  
                  {session.is_active && (
                    <Badge variant="default" className="mt-2">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              
              {session.notes && !session.notes.includes('Auto-terminated') && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">"{session.notes}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
