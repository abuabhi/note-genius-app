
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'study_session' | 'flashcard_review' | 'quiz_completed' | 'note_created';
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  metadata?: Record<string, any>;
}

export const useRecentActivity = () => {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      const activities: ActivityItem[] = [];

      try {
        // Get recent study sessions
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('end_time', 'is', null)
          .order('end_time', { ascending: false })
          .limit(5);

        if (sessions) {
          sessions.forEach(session => {
            activities.push({
              id: session.id,
              type: 'study_session',
              title: session.title || 'Study Session',
              description: `Studied for ${Math.round((session.duration || 0) / 60)} minutes`,
              timestamp: session.end_time!,
              relativeTime: formatDistanceToNow(new Date(session.end_time!), { addSuffix: true }),
              metadata: {
                duration: session.duration,
                cardsReviewed: session.cards_reviewed,
                subject: session.subject
              }
            });
          });
        }

        // Get recent quiz results
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select(`
            *,
            quiz:quizzes(title)
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(3);

        if (quizResults) {
          quizResults.forEach(result => {
            activities.push({
              id: result.id,
              type: 'quiz_completed',
              title: `Quiz: ${result.quiz?.title || 'Unknown Quiz'}`,
              description: `Scored ${result.score}/${result.total_questions} (${Math.round((result.score / result.total_questions) * 100)}%)`,
              timestamp: result.completed_at,
              relativeTime: formatDistanceToNow(new Date(result.completed_at), { addSuffix: true }),
              metadata: {
                score: result.score,
                totalQuestions: result.total_questions,
                duration: result.duration_seconds
              }
            });
          });
        }

        // Get recent notes
        const { data: notes } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (notes) {
          notes.forEach(note => {
            activities.push({
              id: note.id,
              type: 'note_created',
              title: `Note: ${note.title}`,
              description: `Created in ${note.subject}`,
              timestamp: note.created_at,
              relativeTime: formatDistanceToNow(new Date(note.created_at), { addSuffix: true }),
              metadata: {
                subject: note.subject
              }
            });
          });
        }

        // Sort all activities by timestamp (most recent first)
        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8); // Limit to 8 most recent activities
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  return { activities, isLoading };
};
