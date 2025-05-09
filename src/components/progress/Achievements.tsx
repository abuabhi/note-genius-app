
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Award, Clock, Zap, BookOpen, Star, Brain, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_image: string | null;
  achieved_at: string | null;
  points: number;
  type: string;
  icon: React.ReactNode;
}

export const Achievements = () => {
  const { user } = useAuth();
  
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch user achievements from the database
      const { data: userAchievements, error } = await supabase
        .from('study_achievements')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching achievements:', error);
        throw error;
      }
      
      // Get the list of all available achievements
      const { data: allAchievements, error: allError } = await supabase
        .from('study_achievements')
        .select('type, title, description, points')
        .eq('user_id', null); // System-defined achievements have null user_id
      
      if (allError) {
        console.error('Error fetching all achievements:', allError);
      }
      
      // Map achievements with their icons
      const mappedAchievements: Achievement[] = (userAchievements || []).map(achievement => ({
        ...achievement,
        icon: getAchievementIcon(achievement.type)
      }));
      
      // Add available but not yet achieved achievements
      if (allAchievements) {
        allAchievements.forEach(achievement => {
          const exists = mappedAchievements.some(a => a.type === achievement.type);
          
          if (!exists) {
            mappedAchievements.push({
              id: `pending-${achievement.type}`,
              title: achievement.title,
              description: achievement.description,
              badge_image: null,
              achieved_at: null,
              points: achievement.points,
              type: achievement.type,
              icon: getAchievementIcon(achievement.type)
            });
          }
        });
      }
      
      return mappedAchievements;
    },
    enabled: !!user
  });

  if (isLoading) {
    return <AchievementsLoading />;
  }

  const earnedAchievements = achievements.filter(a => a.achieved_at);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-muted-foreground">Track your learning milestones and accomplishments</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{earnedAchievements.length}/{achievements.length}</div>
          <div className="text-muted-foreground">Total points: {totalPoints}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement}
            isEarned={!!achievement.achieved_at}
          />
        ))}
      </div>
    </div>
  );
};

const AchievementCard = ({ 
  achievement, 
  isEarned 
}: { 
  achievement: Achievement; 
  isEarned: boolean;
}) => {
  return (
    <Card className={`${isEarned ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-indigo-200' : 'opacity-70 grayscale'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {achievement.title}
          </CardTitle>
          
          {isEarned && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              +{achievement.points} pts
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isEarned ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-400'}`}>
            {achievement.icon}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {isEarned && achievement.achieved_at && (
              <p className="text-xs text-primary font-medium mt-1">
                Achieved on {new Date(achievement.achieved_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AchievementsLoading = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="text-right">
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="opacity-70">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-1/2 mb-1" />
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'streak':
      return <Zap className="h-5 w-5" />;
    case 'quiz_master':
      return <Trophy className="h-5 w-5" />;
    case 'time_spent':
      return <Clock className="h-5 w-5" />;
    case 'flashcard_master':
      return <BookOpen className="h-5 w-5" />;
    case 'first_set':
      return <Award className="h-5 w-5" />;
    case 'perfect_score':
      return <Star className="h-5 w-5" />;
    case 'consistent_learner': 
      return <Target className="h-5 w-5" />;
    default:
      return <Brain className="h-5 w-5" />;
  }
};
