import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

const RecentActivityFeed = () => {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activity')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching activity:", error);
        } else {
          setActivity(data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user]);

  const getActivityDescription = (item: Activity) => {
    switch (item.activity_type) {
      case 'note_created':
        return `Created a new note: ${item.description}`;
      case 'flashcard_set_created':
        return `Created a new flashcard set: ${item.description}`;
      case 'quiz_created':
        return `Created a new quiz: ${item.description}`;
      default:
        return item.description;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <p>Loading activity...</p>
        ) : activity.length > 0 ? (
          <ul className="space-y-3">
            {activity.map((item) => (
              <li key={item.id} className="text-sm">
                {getActivityDescription(item)} - {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
