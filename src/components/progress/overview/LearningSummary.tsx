
import { BookOpen, Calendar, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "../shared/MetricCard";

interface LearningSummaryProps {
  totalCardsMastered: number;
  studyTimeHours: number;
  totalSets: number;
}

const LearningSummary = ({ totalCardsMastered, studyTimeHours, totalSets }: LearningSummaryProps) => {
  const { user } = useAuth();

  const { data: achievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_achievements')
        .select('*')
        .eq('user_id', user.id)
        .not('achieved_at', 'is', null);

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data;
    },
    enabled: !!user,
  });

  const { data: totalAchievements = 0 } = useQuery({
    queryKey: ['total-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_achievements')
        .select('id')
        .is('user_id', null);

      if (error) {
        console.error('Error fetching total achievements:', error);
        return 0;
      }

      return data.length;
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <MetricCard
        title="Cards Mastered"
        value={totalCardsMastered}
        icon={BookOpen}
        subtitle="High retention flashcards"
      />

      <MetricCard
        title="Study Time"
        value={`${studyTimeHours} hrs`}
        icon={Calendar}
        subtitle="Total hours in sessions"
      />

      <MetricCard
        title="Achievements"
        value={`${achievements.length}/${totalAchievements}`}
        icon={Trophy}
        subtitle="Earned milestones"
      />

      <MetricCard
        title="Flashcard Sets"
        value={totalSets}
        icon={BookOpen}
        subtitle="Total sets created"
      />
    </div>
  );
};

export default LearningSummary;
