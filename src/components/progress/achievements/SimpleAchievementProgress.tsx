
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Star, Trophy } from "lucide-react";
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

export const SimpleAchievementProgress = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      
      // 1. Fetch achievement templates
      console.log('Fetching achievement templates...');
      const { data: templates, error: templatesError } = await supabase
        .from('study_achievements')
        .select('*')
        .is('user_id', null);

      if (templatesError) {
        console.error('Error fetching templates:', templatesError);
        return;
      }

      console.log('Templates fetched:', templates?.length || 0);

      if (!templates || templates.length === 0) {
        console.log('No templates found');
        setAchievements([]);
        return;
      }

      // 2. Fetch earned achievements
      console.log('Fetching earned achievements...');
      const { data: earnedAchievements, error: earnedError } = await supabase
        .from('study_achievements')
        .select('title')
        .eq('user_id', user.id);

      if (earnedError) {
        console.error('Error fetching earned achievements:', earnedError);
      }

      const earnedTitles = new Set(earnedAchievements?.map(a => a.title) || []);
      console.log('Earned achievements:', Array.from(earnedTitles));

      // 3. Fetch user stats directly
      console.log('Fetching user stats...');
      
      // Get flashcard sets count
      const { data: flashcardSets } = await supabase
        .from('flashcard_sets')
        .select('id')
        .eq('user_id', user.id);

      // Get flashcard progress for mastered cards
      const { data: progress } = await supabase
        .from('user_flashcard_progress')
        .select('last_score, ease_factor, interval')
        .eq('user_id', user.id);

      // Get study sessions
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
        streakDays: 0 // Simplified for now
      };

      console.log('User stats calculated:', stats);

      // 4. Create achievements with progress
      const achievementsWithProgress: AchievementWithProgress[] = templates.map(template => {
        const isEarned = earnedTitles.has(template.title);
        const { current, target, progress } = calculateProgress(template.title, stats, isEarned);

        console.log(`${template.title}: progress=${progress}%, current=${current}, target=${target}, earned=${isEarned}`);

        return {
          ...template,
          progress,
          current,
          target,
          isEarned
        };
      });

      // Sort by progress (incomplete first), then by title
      const sortedAchievements = achievementsWithProgress.sort((a, b) => {
        if (a.progress !== b.progress) {
          return a.progress - b.progress;
        }
        return a.title.localeCompare(b.title);
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
      console.log('SimpleAchievementProgress: User found, fetching data');
      fetchAchievementsData();
    } else {
      console.log('SimpleAchievementProgress: No user, clearing achievements');
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
    return <Trophy className="h-5 w-5 text-yellow-500" />;
  };

  const getBadgeColor = (type: string) => {
    const colors = {
      'flashcard': 'bg-blue-100 text-blue-800 border-blue-300',
      'study': 'bg-green-100 text-green-800 border-green-300',
      'streak': 'bg-purple-100 text-purple-800 border-purple-300',
      'goal': 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Achievement Progress
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.length > 0 ? (
          <>
            {achievements.map((achievement) => (
              <div key={achievement.id} className="space-y-3 p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      {getIcon(achievement.badge_image)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={getBadgeColor(achievement.type)}
                        >
                          {achievement.type}
                        </Badge>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          <Star className="h-3 w-3 mr-1" />
                          {achievement.points} pts
                        </Badge>
                        {achievement.isEarned && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(achievement.progress)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.current}/{achievement.target}
                    </div>
                  </div>
                </div>
                <Progress value={achievement.progress} className="h-2" />
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-4">
            <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No achievements available. Please try refreshing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
