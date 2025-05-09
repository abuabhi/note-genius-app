
import { formatDistanceToNow } from "date-fns";
import { StudySession } from "@/hooks/useStudySessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/utils/formatTime";
import { CalendarDays, BookOpen, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface StudySessionListProps {
  sessions?: StudySession[];
  isLoading?: boolean;
  filter?: string;
}

export const StudySessionList = ({ sessions = [], isLoading = false, filter }: StudySessionListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-12 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't recorded any study sessions yet.</p>
            <p className="text-sm mt-2">Start a new session to begin tracking your study time!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Study Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{session.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <CalendarDays className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(session.start_time), { addSuffix: true })}
                    </span>
                    {session.subject && (
                      <>
                        <span className="mx-1">•</span>
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        <span>{session.subject}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-medium">{formatDuration(session.duration)}</span>
                  </div>
                  {session.is_active && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
