
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, TrendingUp, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const FlashcardsAnalytics = () => {
  const { user } = useAuth();

  const { data: flashcardData, isLoading } = useQuery({
    queryKey: ['flashcards-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get flashcard sets
      const { data: sets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          flashcards!inner(
            id,
            user_flashcard_progress(mastery_level, last_reviewed_at, review_count)
          )
        `)
        .eq('user_id', user.id);

      if (setsError) throw setsError;

      const totalSets = sets?.length || 0;
      const totalFlashcards = sets?.reduce((acc, set) => acc + (set.flashcards?.length || 0), 0) || 0;
      
      // Calculate mastery levels
      let masteredCards = 0;
      let reviewedCards = 0;
      let totalReviews = 0;
      const masteryData: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      sets?.forEach(set => {
        set.flashcards?.forEach((card: any) => {
          const progress = card.user_flashcard_progress?.[0];
          if (progress) {
            reviewedCards++;
            totalReviews += progress.review_count || 0;
            const level = progress.mastery_level || 1;
            masteryData[level] = (masteryData[level] || 0) + 1;
            if (level >= 4) masteredCards++;
          } else {
            masteryData[1]++;
          }
        });
      });

      // Subject performance
      const subjectPerformance: Record<string, { total: number; mastered: number }> = {};
      sets?.forEach(set => {
        if (set.subject) {
          if (!subjectPerformance[set.subject]) {
            subjectPerformance[set.subject] = { total: 0, mastered: 0 };
          }
          subjectPerformance[set.subject].total += set.flashcards?.length || 0;
          
          set.flashcards?.forEach((card: any) => {
            const progress = card.user_flashcard_progress?.[0];
            if (progress && (progress.mastery_level || 1) >= 4) {
              subjectPerformance[set.subject].mastered++;
            }
          });
        }
      });

      const subjectData = Object.entries(subjectPerformance)
        .map(([subject, data]) => ({
          subject,
          mastery: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
          total: data.total
        }))
        .sort((a, b) => b.mastery - a.mastery);

      // Mastery distribution for chart
      const masteryChartData = Object.entries(masteryData).map(([level, count]) => ({
        level: `Level ${level}`,
        count,
        percentage: totalFlashcards > 0 ? Math.round((count / totalFlashcards) * 100) : 0
      }));

      const accuracyRate = reviewedCards > 0 ? Math.round((masteredCards / reviewedCards) * 100) : 0;
      const avgReviews = reviewedCards > 0 ? Math.round(totalReviews / reviewedCards) : 0;

      return {
        totalSets,
        totalFlashcards,
        masteredCards,
        reviewedCards,
        accuracyRate,
        avgReviews,
        subjectData,
        masteryChartData
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!flashcardData) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{flashcardData.totalSets}</div>
            <p className="text-sm text-blue-600">Flashcard Sets</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint-800">{flashcardData.totalFlashcards}</div>
            <p className="text-sm text-mint-600">Total Cards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{flashcardData.masteredCards}</div>
            <p className="text-sm text-green-600">Mastered</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{flashcardData.accuracyRate}%</div>
            <p className="text-sm text-purple-600">Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Distribution */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800">
              Mastery Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flashcardData.masteryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800">
              Subject Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flashcardData.subjectData.length > 0 ? (
              <div className="space-y-4">
                {flashcardData.subjectData.slice(0, 5).map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.subject}</span>
                      <Badge 
                        variant="outline" 
                        className={`${
                          item.mastery >= 80 ? 'text-green-700 border-green-300' :
                          item.mastery >= 60 ? 'text-blue-700 border-blue-300' :
                          'text-orange-700 border-orange-300'
                        }`}
                      >
                        {item.mastery}%
                      </Badge>
                    </div>
                    <Progress value={item.mastery} className="h-2" />
                    <p className="text-xs text-gray-500">{item.total} cards total</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No flashcard data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-mint-800">
            Study Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-600">{flashcardData.reviewedCards}</div>
              <p className="text-sm text-gray-600">Cards Reviewed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{flashcardData.avgReviews}</div>
              <p className="text-sm text-gray-600">Avg Reviews</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {flashcardData.totalFlashcards > 0 ? Math.round((flashcardData.masteredCards / flashcardData.totalFlashcards) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">Overall Mastery</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {flashcardData.totalFlashcards - flashcardData.reviewedCards}
              </div>
              <p className="text-sm text-gray-600">Not Reviewed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
