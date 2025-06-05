
import { formatDistanceToNow } from "date-fns";
import { formatDuration } from "@/utils/formatTime";
import { CalendarDays, BookOpen, Clock, Calendar, Target, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancedStudySession {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  notes?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  is_active: boolean;
  flashcard_set_id?: string;
  focus_time?: number;
  break_time?: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  activity_type?: string;
  cards_reviewed?: number;
  cards_correct?: number;
  quiz_score?: number;
  quiz_total_questions?: number;
  notes_created?: number;
  notes_reviewed?: number;
  learning_velocity?: number;
  session_quality?: string;
  auto_created?: boolean;
}

interface StudySessionListProps {
  sessions?: EnhancedStudySession[];
  isLoading?: boolean;
  filter?: string;
}

export const StudySessionList = ({ sessions = [], isLoading = false, filter }: StudySessionListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-mint-800 mb-4">Study Sessions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg border border-mint-100 p-4 shadow-sm">
              <div className="h-5 bg-mint-100 rounded animate-pulse mb-2" />
              <div className="h-4 bg-mint-50 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-mint-100 p-8 shadow-sm">
          <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-mint-500" />
          </div>
          <h3 className="text-lg font-semibold text-mint-800 mb-2">No Study Sessions Yet</h3>
          <p className="text-mint-600 mb-4">You haven't recorded any study sessions yet.</p>
          <p className="text-sm text-mint-500">Start studying flashcards, taking quizzes, or reviewing notes to automatically track your sessions!</p>
        </div>
      </div>
    );
  }

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      case 'short': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'excessive': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getActivityIcon = (activityType?: string) => {
    switch (activityType) {
      case 'flashcard': return BookOpen;
      case 'quiz': return Target;
      case 'note': return BookOpen;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-mint-800 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-mint-600" />
        Study Sessions
      </h3>
      
      <div className="space-y-3">
        {sessions.slice(0, 20).map((session) => {
          const ActivityIcon = getActivityIcon(session.activity_type);
          const accuracy = session.cards_reviewed && session.cards_reviewed > 0 ? 
            Math.round((session.cards_correct || 0) / session.cards_reviewed * 100) : 0;
          const quizAccuracy = session.quiz_total_questions && session.quiz_total_questions > 0 ? 
            Math.round((session.quiz_score || 0) / session.quiz_total_questions * 100) : 0;

          return (
            <div 
              key={session.id}
              className="bg-white/70 backdrop-blur-sm rounded-lg border border-mint-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-mint-900 truncate">{session.title}</h4>
                    {session.auto_created && (
                      <Badge variant="outline" className="text-xs">Auto</Badge>
                    )}
                    {session.session_quality && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getQualityColor(session.session_quality)}`}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {session.session_quality.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-mint-600 mb-2">
                    <div className="flex items-center gap-1">
                      <ActivityIcon className="h-3.5 w-3.5" />
                      <span>{session.activity_type || 'general'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {formatDistanceToNow(new Date(session.start_time), { addSuffix: true })}
                      </span>
                    </div>
                    {session.subject && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="truncate max-w-32">{session.subject}</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced metrics */}
                  <div className="flex items-center gap-4 text-sm">
                    {session.cards_reviewed && session.cards_reviewed > 0 && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{session.cards_reviewed} cards</span>
                        {accuracy > 0 && (
                          <span className="text-green-600">({accuracy}%)</span>
                        )}
                      </div>
                    )}
                    
                    {session.quiz_total_questions && session.quiz_total_questions > 0 && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Target className="h-3.5 w-3.5" />
                        <span>{session.quiz_total_questions} questions</span>
                        {quizAccuracy > 0 && (
                          <span className="text-green-600">({quizAccuracy}%)</span>
                        )}
                      </div>
                    )}

                    {(session.notes_created || session.notes_reviewed) && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>
                          {session.notes_created && `${session.notes_created} created`}
                          {session.notes_created && session.notes_reviewed && ', '}
                          {session.notes_reviewed && `${session.notes_reviewed} reviewed`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-4">
                  {session.duration && (
                    <div className="flex items-center gap-1 bg-mint-50 px-3 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5 text-mint-600" />
                      <span className="text-sm font-medium text-mint-700">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  )}
                  {session.is_active && (
                    <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-700">Active</span>
                    </div>
                  )}
                </div>
              </div>
              
              {session.notes && (
                <div className="mt-3 pt-3 border-t border-mint-100">
                  <p className="text-sm text-mint-600 line-clamp-2">{session.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {sessions.length > 20 && (
        <div className="text-center pt-4">
          <p className="text-sm text-mint-600">
            Showing 20 of {sessions.length} sessions
          </p>
        </div>
      )}
    </div>
  );
};
