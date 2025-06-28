
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export const QuizAnalytics = () => {
  const { user } = useAuth();

  const { data: quizData, isLoading } = useQuery({
    queryKey: ['quiz-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get quiz results
      const { data: results, error: resultsError } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quizzes(title, subject_id, academic_subjects(name))
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Get quiz sessions (flashcard-based quizzes)
      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      const totalQuizzes = (results?.length || 0) + (sessions?.length || 0);
      const totalScore = results?.reduce((acc, result) => acc + result.score, 0) || 0;
      const totalQuestions = results?.reduce((acc, result) => acc + result.total_questions, 0) || 0;
      
      // Calculate flashcard quiz stats
      const flashcardQuizScore = sessions?.reduce((acc, session) => acc + session.correct_answers, 0) || 0;
      const flashcardQuizQuestions = sessions?.reduce((acc, session) => acc + session.total_cards, 0) || 0;

      const overallAccuracy = (totalQuestions + flashcardQuizQuestions) > 0 
        ? Math.round(((totalScore + flashcardQuizScore) / (totalQuestions + flashcardQuizQuestions)) * 100)
        : 0;

      // Average score
      const avgScore = results?.length > 0 
        ? Math.round(results.reduce((acc, result) => acc + (result.score / result.total_questions * 100), 0) / results.length)
        : 0;

      // Subject performance
      const subjectPerformance: Record<string, { scores: number[]; totalQuestions: number; totalScore: number }> = {};
      
      results?.forEach(result => {
        const subjectName = result.quizzes?.academic_subjects?.name || 'Unknown';
        if (!subjectPerformance[subjectName]) {
          subjectPerformance[subjectName] = { scores: [], totalQuestions: 0, totalScore: 0 };
        }
        const percentage = (result.score / result.total_questions) * 100;
        subjectPerformance[subjectName].scores.push(percentage);
        subjectPerformance[subjectName].totalQuestions += result.total_questions;
        subjectPerformance[subjectName].totalScore += result.score;
      });

      const subjectData = Object.entries(subjectPerformance)
        .map(([subject, data]) => ({
          subject,
          avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          quizCount: data.scores.length,
          accuracy: Math.round((data.totalScore / data.totalQuestions) * 100)
        }))
        .sort((a, b) => b.avgScore - a.avgScore);

      // Performance trend (last 10 quizzes)
      const recentResults = results?.slice(0, 10).reverse() || [];
      const trendData = recentResults.map((result, index) => ({
        quiz: index + 1,
        score: Math.round((result.score / result.total_questions) * 100),
        date: new Date(result.completed_at).toLocaleDateString()
      }));

      // Difficulty analysis
      const excellentQuizzes = results?.filter(r => (r.score / r.total_questions) >= 0.9).length || 0;
      const goodQuizzes = results?.filter(r => {
        const score = r.score / r.total_questions;
        return score >= 0.7 && score < 0.9;
      }).length || 0;
      const needsImprovementQuizzes = results?.filter(r => (r.score / r.total_questions) < 0.7).length || 0;

      return {
        totalQuizzes,
        overallAccuracy,
        avgScore,
        subjectData,
        trendData,
        excellentQuizzes,
        goodQuizzes,
        needsImprovementQuizzes,
        totalQuestions: totalQuestions + flashcardQuizQuestions,
        correctAnswers: totalScore + flashcardQuizScore
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

  if (!quizData) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{quizData.totalQuizzes}</div>
            <p className="text-sm text-purple-600">Quizzes Taken</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{quizData.overallAccuracy}%</div>
            <p className="text-sm text-green-600">Overall Accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{quizData.avgScore}%</div>
            <p className="text-sm text-blue-600">Average Score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint-800">{quizData.correctAnswers}</div>
            <p className="text-sm text-mint-600">Correct Answers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800">
              Recent Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {quizData.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quizData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quiz" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <Trophy className="h-12 w-12 opacity-50 mb-2" />
                <p>No quiz data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800">
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizData.subjectData.length > 0 ? (
              <div className="space-y-4">
                {quizData.subjectData.slice(0, 5).map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.subject}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.quizCount} quiz{item.quizCount !== 1 ? 'es' : ''}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${
                            item.accuracy >= 80 ? 'text-green-700 border-green-300' :
                            item.accuracy >= 60 ? 'text-blue-700 border-blue-300' :
                            'text-orange-700 border-orange-300'
                          }`}
                        >
                          {item.accuracy}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No subject data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-mint-800">
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {quizData.excellentQuizzes}
              </div>
              <p className="text-sm text-green-700">Excellent (90%+)</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {quizData.goodQuizzes}
              </div>
              <p className="text-sm text-blue-700">Good (70-89%)</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {quizData.needsImprovementQuizzes}
              </div>
              <p className="text-sm text-orange-700">Needs Work (&lt;70%)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
