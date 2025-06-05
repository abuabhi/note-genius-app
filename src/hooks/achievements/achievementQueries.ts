
import { supabase } from "@/integrations/supabase/client";

export const fetchAchievementTemplates = async () => {
  console.log('Fetching achievement templates...');
  const { data: templates, error: templatesError } = await supabase
    .from('study_achievements')
    .select('*')
    .filter('user_id', 'is', null);

  console.log('Raw templates response:', { templates, templatesError });

  if (templatesError) {
    console.error('Error fetching achievement templates:', templatesError);
    throw templatesError;
  }

  return templates || [];
};

export const fetchEarnedAchievements = async (userId: string) => {
  const { data: earnedAchievements, error: earnedError } = await supabase
    .from('study_achievements')
    .select('title')
    .eq('user_id', userId);

  console.log('Earned achievements response:', { earnedAchievements, earnedError });

  if (earnedError) {
    console.error('Error fetching earned achievements:', earnedError);
    throw earnedError;
  }

  return new Set(earnedAchievements?.map(a => a.title) || []);
};
