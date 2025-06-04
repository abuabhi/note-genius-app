
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Target, Zap, Star, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  current: number;
  target: number;
  completed: boolean;
  icon: React.ReactNode;
  category: string;
}

const QuizAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateAchievements();
    }
  }, [user]);

  const calculateAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's quiz results
      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id);

      // Fetch user's created quizzes
      const { data: userQuizzes } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id);

      const totalQuizzesTaken = quizResults?.length || 0;
      const totalQuizzesCreated = userQuizzes?.length || 0;
      const perfectScores = quizResults?.filter(r => r.score === r.total_questions).length || 0;
      const averageScore = quizResults?.length 
        ? quizResults.reduce((sum, r) => sum + (r.score / r.total_questions), 0) / quizResults.length * 100
        : 0;

      // Calculate fast completion times (under 60 seconds)
      const fastCompletions = quizResults?.filter(r => 
        r.duration_seconds && r.duration_seconds < 60
      ).length || 0;

      // Calculate quiz streak (quizzes taken in consecutive days)
      const quizDates = quizResults?.map(r => new Date(r.completed_at).toDateString()) || [];
      const uniqueDates = [...new Set(quizDates)].sort();
      let currentStreak = 0;
      let maxStreak = 0;
      
      for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(uniqueDates[i - 1]);
          const currentDate = new Date(uniqueDates[i]);
          const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);

      const calculatedAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Quiz Beginner',
          description: 'Complete your first quiz',
          current: Math.min(totalQuizzesTaken, 1),
          target: 1,
          progress: Math.min(totalQuizzesTaken / 1 * 100, 100),
          completed: totalQuizzesTaken >= 1,
          icon: <Trophy className="h-5 w-5" />,
          category: 'milestone'
        },
        {
          id: '2',
          title: 'Quiz Master',
          description: 'Complete 10 quizzes',
          current: Math.min(totalQuizzesTaken, 10),
          target: 10,
          progress: Math.min(totalQuizzesTaken / 10 * 100, 100),
          completed: totalQuizzesTaken >= 10,
          icon: <Award className="h-5 w-5" />,
          category: 'milestone'
        },
        {
          id: '3',
          title: 'Perfect Score',
          description: 'Get a perfect score on any quiz',
          current: Math.min(perfectScores, 1),
          target: 1,
          progress: Math.min(perfectScores / 1 * 100, 100),
          completed: perfectScores >= 1,
          icon: <Target className="h-5 w-5" />,
          category: 'performance'
        },
        {
          id: '4',
          title: 'Speed Demon',
          description: 'Complete a quiz in under 60 seconds',
          current: Math.min(fastCompletions, 1),
          target: 1,
          progress: Math.min(fastCompletions / 1 * 100, 100),
          completed: fastCompletions >= 1,
          icon: <Zap className="h-5 w-5" />,
          category: 'performance'
        },
        {
          id: '5',
          title: 'Quiz Creator',
          description: 'Create your first quiz',
          current: Math.min(totalQuizzesCreated, 1),
          target: 1,
          progress: Math.min(totalQuizzesCreated / 1 * 100, 100),
          completed: totalQuizzesCreated >= 1,
          icon: <Star className="h-5 w-5" />,
          category: 'creator'
        },
        {
          id: '6',
          title: 'Streak Starter',
          description: 'Take quizzes for 3 consecutive days',
          current: Math.min(maxStreak, 3),
          target: 3,
          progress: Math.min(maxStreak / 3 * 100, 100),
          completed: maxStreak >= 3,
          icon: <Calendar className="h-5 w-5" />,
          category: 'consistency'
        }
      ];

      setAchievements(calculatedAchievements);
    } catch (error) {
      console.error('Error calculating achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'creator':
        return 'bg-purple-100 text-purple-800';
      case 'consistency':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4">
            <div className="h-12 w-12 bg-mint-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-mint-200 rounded w-1/3"></div>
              <div className="h-3 bg-mint-200 rounded w-2/3"></div>
              <div className="h-2 bg-mint-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <div key={achievement.id} className="flex items-start gap-4 p-4 rounded-lg border border-mint-100 bg-white/50">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            achievement.completed ? 'bg-mint-100 text-mint-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {achievement.icon}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-mint-800">{achievement.title}</h3>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(achievement.category)}>
                  {achievement.category}
                </Badge>
                {achievement.completed && (
                  <Badge className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-mint-600">{achievement.description}</p>
            <div className="flex items-center gap-3">
              <Progress 
                value={achievement.progress} 
                className="flex-1 h-2"
              />
              <span className="text-sm text-mint-600 font-medium min-w-fit">
                {achievement.current}/{achievement.target}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {achievements.filter(a => a.completed).length === 0 && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-mint-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-mint-800 mb-2">No achievements yet</h3>
          <p className="text-mint-600">
            Start taking quizzes to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizAchievements;
