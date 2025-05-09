
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, BookOpen, FileText, BarChart } from "lucide-react";

type ActivityType = "session" | "note" | "flashcard" | "quiz";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  created_at: string;
  description?: string;
  icon: React.ReactNode;
}

export function RecentActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!user) return;
      setLoading(true);
      
      // Fetch last 5 study sessions
      const { data: sessionData } = await supabase
        .from('study_sessions')
        .select('id, title, start_time, duration')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(5);
        
      // Fetch last 5 notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      // Map to activity format
      const sessionActivities = (sessionData || []).map(session => ({
        id: `session-${session.id}`,
        type: 'session' as ActivityType,
        title: session.title || 'Study Session',
        created_at: session.start_time,
        description: `Duration: ${Math.floor(session.duration / 60)} minutes`,
        icon: <Clock className="h-4 w-4 text-blue-500" />
      }));
      
      const noteActivities = (notesData || []).map(note => ({
        id: `note-${note.id}`,
        type: 'note' as ActivityType,
        title: note.title || 'Note',
        created_at: note.created_at,
        description: 'Note created',
        icon: <FileText className="h-4 w-4 text-green-500" />
      }));
      
      // Combine and sort by date
      const combinedActivities = [...sessionActivities, ...noteActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setActivities(combinedActivities);
      setLoading(false);
    }
    
    fetchRecentActivity();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[350px] overflow-auto">
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground">No recent activity found</p>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="mt-1">{activity.icon}</div>
              <div>
                <h4 className="font-medium">{activity.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(activity.created_at), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
