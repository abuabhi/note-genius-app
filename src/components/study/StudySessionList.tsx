
import { formatDistanceToNow } from "date-fns";
import { StudySession } from "@/hooks/useStudySessions";
import { formatDuration } from "@/utils/formatTime";
import { CalendarDays, BookOpen, Clock } from "lucide-react";

interface StudySessionListProps {
  sessions?: StudySession[];
  isLoading?: boolean;
  filter?: string;
}

export const StudySessionList = ({ sessions = [], isLoading = false, filter }: StudySessionListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-mint-800 mb-4">Recent Study Sessions</h3>
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
          <p className="text-sm text-mint-500">Start a new session to begin tracking your study time!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-mint-800 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-mint-600" />
        Recent Study Sessions
      </h3>
      
      <div className="space-y-3">
        {sessions.slice(0, 10).map((session) => (
          <div 
            key={session.id}
            className="bg-white/70 backdrop-blur-sm rounded-lg border border-mint-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-mint-900 truncate mb-1">{session.title}</h4>
                <div className="flex items-center gap-4 text-sm text-mint-600">
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
        ))}
      </div>
      
      {sessions.length > 10 && (
        <div className="text-center pt-4">
          <p className="text-sm text-mint-600">
            Showing 10 of {sessions.length} sessions
          </p>
        </div>
      )}
    </div>
  );
};
