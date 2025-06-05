
import { supabase } from "@/integrations/supabase/client";

export const fetchAchievementTemplates = async () => {
  console.log('Fetching achievement templates...');
  
  // Fix the query syntax - use .is() instead of .filter() for null checks
  const { data: templates, error: templatesError } = await supabase
    .from('study_achievements')
    .select('*')
    .is('user_id', null);

  console.log('Raw templates response:', { templates, templatesError });
  console.log('Templates count:', templates?.length || 0);

  if (templatesError) {
    console.error('Error fetching achievement templates:', templatesError);
    throw templatesError;
  }

  // Add more detailed logging
  if (templates && templates.length > 0) {
    console.log('Achievement templates found:', templates.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      points: t.points
    })));
  } else {
    console.log('No achievement templates found in database');
  }

  return templates || [];
};

export const fetchEarnedAchievements = async (userId: string) => {
  console.log('Fetching earned achievements for user:', userId);
  
  const { data: earnedAchievements, error: earnedError } = await supabase
    .from('study_achievements')
    .select('title')
    .eq('user_id', userId);

  console.log('Earned achievements response:', { earnedAchievements, earnedError });
  console.log('Earned achievements count:', earnedAchievements?.length || 0);

  if (earnedError) {
    console.error('Error fetching earned achievements:', earnedError);
    throw earnedError;
  }

  const earnedTitlesSet = new Set(earnedAchievements?.map(a => a.title) || []);
  console.log('Earned titles set:', Array.from(earnedTitlesSet));
  
  return earnedTitlesSet;
};
