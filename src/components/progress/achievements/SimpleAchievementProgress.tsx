import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Star, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  badge_image: string;
}

interface AchievementWithProgress extends AchievementTemplate {
  progress: number;
  current: number;
  target: number;
  isEarned: boolean;
}

interface UserStats {
  totalCardsMastered: number;
  totalSets: number;
  streakDays: number;
  totalSessions: number;
  flashcardAccuracy: number;
}

// Achievement templates to seed if they don't exist
const ACHIEVEMENT_TEMPLATES = [
  {
    title: 'First Steps',
    description: 'Review your first flashcard',
    type: 'flashcard',
    points: 10,
    badge_image: 'first-steps'
  },
  {
    title: 'Getting Started',
    description: 'Create your first flashcard set',
    type: 'flashcard',
    points: 15,
    badge_image: 'getting-started'
  },
  {
    title: 'Study Streak',
    description: 'Study for 3 consecutive days',
    type: 'streak',
    points: 25,
    badge_image: 'study-streak'
  },
  {
    title: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    type: 'streak',
    points: 50,
    badge_image: 'week-warrior'
  },
  {
    title: 'Flashcard Master',
    description: 'Create 10 flashcard sets',
    type: 'flashcard',
    points: 75,
    badge_image: 'flashcard-master'
  },
  {
    title: 'Goal Crusher',
    description: 'Complete 5 study goals',
    type: 'goal',
    points: 100,
    badge_image: 'goal-crusher'
  },
  {
    title: 'Century Club',
    description: 'Master 100 flashcards',
    type: 'flashcard',
    points: 150,
    badge_image: 'century-club'
  },
  {
    title: 'Study Session Champion',
    description: 'Complete 20 study sessions',
    type: 'study',
    points: 200,
    badge_image: 'session-champion'
  }
];

export const SimpleAchievementProgress = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const seedAchievementTemplates = async () => {
    console.log('Seeding achievement templates...');
    
    try {
      const { error } = await supabase
        .from('study_achievements')
        .insert(ACHIEVEMENT_TEMPLATES.map(template => ({
          ...template,
          user_id: null,
        })));

      if (error) {
        console.error('Error seeding achievement templates:', error);
      } else {
        console.log('Achievement templates seeded successfully');
      }
    } catch (error) {
      console.error('Error in seedAchievementTemplates:', error);
    }
  };

  const calculateProgress = (title: string, stats: UserStats, isEarned: boolean) => {
    let current = 0;
    let target = 1;

    switch (title) {
      case 'First Steps':
        current = stats.totalCardsMastered > 0 ? 1 : 0;
        target = 1;
        break;
      case 'Getting Started':
        current = stats.totalSets > 0 ? 1 : 0;
        target = 1;
        break;
      case 'Study Streak':
        current = Math.min(stats.streakDays, 3);
        target = 3;
        break;
      case 'Week Warrior':
        current = Math.min(stats.streakDays, 7);
        target = 7;
        break;
      case 'Flashcard Master':
        current = Math.min(stats.totalSets, 10);
        target = 10;
        break;
      case 'Goal Crusher':
        current = 0;
        target = 5;
        break;
      case 'Century Club':
        current = Math.min(stats.totalCardsMastered, 100);
        target = 100;
        break;
      case 'Study Session Champion':
        current = Math.min(stats.totalSessions, 20);
        target = 20;
        break;
      default:
        current = 0;
        target = 1;
    }

    let progress = 0;
    if (isEarned) {
      progress = 100;
      current = target;
    } else {
      progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    }

    return { current, target, progress };
  };

  const fetchAchievementsData = async () => {
    if (!user) return;

    try {
      console.log('=== SimpleAchievementProgress: Starting fetch ===');
      
      // Fetch achievement templates
      let { data: templates, error: templatesError } = await supabase
        .from('study_achievements')
        .select('*')
        .is('user_id', null);

      if (templatesError) {
        console.error('Error fetching templates:', templatesError);
        return;
      }

      // If no templates exist, seed them
      if (!templates || templates.length === 0) {
        console.log('No templates found, seeding...');
        await seedAchievementTemplates();
        
        const { data: newTemplates, error: newError } = await supabase
          .from('study_achievements')
          .select('*')
          .is('user_id', null);

        if (newError) {
          console.error('Error fetching templates after seeding:', newError);
          return;
        }

        if (!newTemplates || newTemplates.length === 0) {
          console.error('Still no templates after seeding!');
          setAchievements([]);
          return;
        }

        templates = newTemplates;
      }

      // Fetch earned achievements
      const { data: earnedAchievements, error: earnedError } = await supabase
        .from('study_achievements')
        .select('title')
        .eq('user_id', user.id);

      if (earnedError) {
        console.error('Error fetching earned achievements:', earnedError);
      }

      const earnedTitles = new Set(earnedAchievements?.map(a => a.title) || []);

      // Fetch user stats directly
      const { data: flashcardSets } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user.id);

      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select('last_score, ease_factor, interval')
        .eq('user_id', user.id);

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('id')
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      const stats: UserStats = {
        totalSets: flashcardSets?.length || 0,
        totalCardsMastered: progress?.filter(p => 
          p.ease_factor && p.ease_factor >= 2.5 && 
          p.interval && p.interval >= 7
        ).length || 0,
        totalSessions: sessions?.length || 0,
        flashcardAccuracy: progress && progress.length > 0 
          ? Math.round((progress.reduce((sum, p) => sum + (p.last_score || 0), 0) / (progress.length * 5)) * 100)
          : 0,
        streakDays: 0
      };

      // Create achievements with progress and filter out duplicates and completed ones
      const seenTitles = new Set();
      const achievementsWithProgress: AchievementWithProgress[] = templates
        .filter(template => {
          // Remove duplicates by title
          if (seenTitles.has(template.title)) {
            return false;
          }
          seenTitles.add(template.title);
          return true;
        })
        .map(template => {
          const isEarned = earnedTitles.has(template.title);
          const { current, target, progress } = calculateProgress(template.title, stats, isEarned);

          return {
            ...template,
            progress,
            current,
            target,
            isEarned
          };
        })
        .filter(achievement => achievement.progress < 100); // Filter out completed achievements

      // Sort by progress (closest to completion first)
      const sortedAchievements = achievementsWithProgress.sort((a, b) => {
        return b.progress - a.progress;
      });

      console.log('Final achievements with progress:', sortedAchievements.length);
      setAchievements(sortedAchievements);

    } catch (error) {
      console.error('Error in fetchAchievementsData:', error);
      setAchievements([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAchievementsData();
    } else {
      setAchievements([]);
    }
    setLoading(false);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAchievementsData();
    setRefreshing(false);
  };

  const getIcon = (badgeImage: string) => {
    return <Trophy className="h-4 w-4 text-yellow-500" />;
  };

  const getBadgeColor = (type: string) => {
    const colors = {
      'flashcard': 'bg-blue-50 text-blue-700 border-blue-200',
      'study': 'bg-green-50 text-green-700 border-green-200',
      'streak': 'bg-purple-50 text-purple-700 border-purple-200',
      'goal': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-blue-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-blue-500" />
            Achievement Progress
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 text-xs"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="p-3 rounded-lg border border-mint-100 bg-white hover:bg-mint-50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-100 flex-shrink-0">
                    {getIcon(achievement.badge_image)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-mint-800">{achievement.title}</h4>
                    <p className="text-xs text-mint-600 line-clamp-2">{achievement.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-mint-700">{Math.round(achievement.progress)}%</span>
                    <span className="text-xs text-mint-500">
                      {achievement.current}/{achievement.target}
                    </span>
                  </div>
                  
                  <Progress 
                    value={achievement.progress} 
                    className="h-2" 
                    indicatorClassName="bg-mint-600"
                  />
                  
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-xs h-5 bg-mint-50 text-mint-700 border-mint-200"
                    >
                      {achievement.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs h-5 bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1" />
                      {achievement.points}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Trophy className="h-8 w-8 text-mint-300 mx-auto mb-2" />
            <p className="text-sm text-mint-500">
              Great job! All achievements completed or no achievements available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
