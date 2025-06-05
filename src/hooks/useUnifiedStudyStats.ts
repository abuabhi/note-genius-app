
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useUnifiedStudyStats = () => {
  const { user } = useAuth();

  const { data: stats = {
    totalSessions: 0,
    totalStudyTime: 0,
    averageSessionTime: 0,
    totalCardsMastered: 0,
    totalSets: 0,
    flashcardAccuracy: 0,
    streakDays: 0,
    studyTimeHours: 0
  }, isLoading } = useQuery({
    queryKey: ['unified-study-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('Fetching unified study stats for user:', user.id);

      // Get flashcard sets count - this is the key fix
      const { data: flashcardSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user.id);

      if (setsError) {
        console.error('Error fetching flashcard sets:', setsError);
      }

      const totalSets = flashcardSets?.length || 0;
      console.log('Total flashcard sets found:', totalSets);

      // Get study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration, start_time')
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      const totalSessions = sessions?.length || 0;
      const totalStudyTimeMinutes = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const totalStudyTime = Math.round(totalStudyTimeMinutes / 60 * 10) / 10; // Convert to hours
      const averageSessionTime = totalSessions > 0 ? Math.round(totalStudyTimeMinutes / totalSessions) : 0;

      // Get flashcard progress
      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select('last_score, ease_factor, interval, last_reviewed_at')
        .eq('user_id', user.id);

      // Calculate cards mastered (cards with ease_factor >= 2.5 and interval >= 7)
      const totalCardsMastered = progress?.filter(p => 
        p.ease_factor && p.ease_factor >= 2.5 && 
        p.interval && p.interval >= 7
      ).length || 0;

      // Calculate flashcard accuracy
      let flashcardAccuracy = 0;
      if (progress && progress.length > 0) {
        const totalScore = progress.reduce((sum, p) => sum + (p.last_score || 0), 0);
        flashcardAccuracy = Math.round((totalScore / (progress.length * 5)) * 100);
      }

      // Calculate streak days (simplified - consecutive days with study activity)
      const streakDays = 0; // Placeholder for now

      const result = {
        totalSessions,
        totalStudyTime,
        averageSessionTime,
        totalCardsMastered,
        totalSets,
        flashcardAccuracy,
        streakDays,
        studyTimeHours: totalStudyTime
      };

      console.log('Final unified stats:', result);
      return result;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { stats, isLoading };
};
