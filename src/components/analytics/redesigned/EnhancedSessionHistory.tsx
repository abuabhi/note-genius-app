
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, Award, BookOpen, Brain, Target, TrendingUp } from 'lucide-react';
import { useCleanSessionAnalytics } from '@/hooks/useCleanSessionAnalytics';
import { format } from 'date-fns';

export const EnhancedSessionHistory = () => {
  const { sessions, analytics, isLoading } = useCleanSessionAnalytics();

  const getSessionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-mint-100 text-mint-800 border-mint-200';
      case 'needs_improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'short':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'excessive':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcard_review':
        return <Brain className="h-4 w-4" />;
      case 'quiz':
        return <Target className="h-4 w-4" />;
      case 'note_review':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
      <div className="space-y-6">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Sessions */}
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
      </div>
    );
  }

  // Only show real study sessions (not auto-created ones)
  const realSessions = sessions.filter(session => !session.auto_created);

  return (
    <div className="space-y-6">
      {/* Session Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint-800">{analytics.totalSessions}</div>
            <p className="text-sm text-mint-600">Total Sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{analytics.totalStudyTime}h</div>
            <p className="text-sm text-blue-600">Study Time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{analytics.averageAccuracy}%</div>
            <p className="text-sm text-green-600">Avg Accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{Math.round(analytics.averageSessionTime / 60)}m</div>
            <p className="text-sm text-purple-600">Avg Duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Session Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-mint-900">Study Sessions Timeline</h2>
          <Badge variant="outline" className="text-mint-700 border-mint-300">
            {realSessions.length} real sessions
          </Badge>
        </div>
        
        {realSessions.length === 0 ? (
          <Card className="bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-mint-400 mb-4" />
              <h3 className="text-lg font-medium text-mint-900 mb-2">No Study Sessions Yet</h3>
              <p className="text-mint-600 text-center max-w-md">
                Start studying flashcards, reviewing notes, or taking quizzes to see your session history here. 
                Your sessions will be tracked automatically when you engage in study activities!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {realSessions.map((session: any) => (
              <Card key={session.id} className="hover:shadow-md transition-all duration-200 border-mint-100 hover:border-mint-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getActivityTypeIcon(session.activity_type || 'general')}
                          <h3 className="font-semibold text-mint-900">
                            {session.title || session.subject || 'Study Session'}
                          </h3>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSessionQualityColor(session.session_quality || 'good')}`}
                        >
                          {session.session_quality || 'good'}
                        </Badge>

                        {/* Manual/Offline Session Indicator */}
                        {(session.session_source === 'offline' || session.manual_entry_date) && (
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                            📱 Offline Entry
                          </Badge>
                        )}
                        
                        {session.activity_type && (
                          <Badge variant="secondary" className="text-xs bg-mint-100 text-mint-700">
                            {session.activity_type.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-mint-600" />
                          {session.start_time ? format(new Date(session.start_time), 'MMM d, yyyy • h:mm a') : 'Unknown time'}
                          {session.manual_entry_date && session.manual_entry_date !== session.start_time?.split('T')[0] && (
                            <span className="text-orange-600 text-xs ml-2">
                              (Added manually)
                            </span>
                          )}
                        </div>
                        
                        {session.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            {formatDuration(session.duration)}
                          </div>
                        )}
                      </div>
                      
                      {session.subject && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs border-mint-300 text-mint-700">
                            📚 {session.subject}
                          </Badge>
                        </div>
                      )}

                      {/* Performance Metrics */}
                      {session.cards_reviewed > 0 && (
                        <div className="bg-mint-50 rounded-lg p-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-mint-800">Performance</span>
                            <span className="text-sm text-mint-600">
                              {session.cards_correct || 0}/{session.cards_reviewed} cards
                            </span>
                          </div>
                          <Progress 
                            value={Math.round(((session.cards_correct || 0) / session.cards_reviewed) * 100)} 
                            className="h-2 mb-1"
                          />
                          <div className="text-xs text-mint-600">
                            {Math.round(((session.cards_correct || 0) / session.cards_reviewed) * 100)}% accuracy
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-6 flex flex-col items-end gap-2">
                      {session.cards_reviewed > 0 && (
                        <div className="flex items-center gap-2 text-sm text-mint-600">
                          <Brain className="h-4 w-4" />
                          <span>{session.cards_reviewed} cards</span>
                        </div>
                      )}
                      
                      {session.is_active && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                          🟢 Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {session.notes && !session.notes.includes('Auto-terminated') && (
                    <div className="mt-4 pt-4 border-t border-mint-100">
                      <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                        💭 "{session.notes}"
                      </p>
                    </div>
                  )}

                  {/* Manual Entry Notes */}
                  {session.manual_entry_notes && (
                    <div className="mt-4 pt-4 border-t border-orange-100">
                      <p className="text-sm text-orange-600 italic bg-orange-50 p-3 rounded-lg border-l-4 border-orange-300">
                        📝 Manual Entry: "{session.manual_entry_notes}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
