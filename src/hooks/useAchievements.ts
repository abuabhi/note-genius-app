
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  achieved_at: string | null;
  points: number;
  badge_image: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserAchievements = async () => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('study_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
      } else {
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('check_and_award_achievements', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking achievements:', error);
        return;
      }

      // If new achievements were awarded, show notifications and refresh
      if (data && data.length > 0) {
        data.forEach((achievement: { new_achievement_title: string }) => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `You've earned: ${achievement.new_achievement_title}`,
            duration: 5000,
          });
        });
        
        // Refresh achievements list
        await fetchUserAchievements();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  useEffect(() => {
    fetchUserAchievements();
  }, [user]);

  return {
    achievements,
    loading,
    fetchUserAchievements,
    checkAndAwardAchievements
  };
};
