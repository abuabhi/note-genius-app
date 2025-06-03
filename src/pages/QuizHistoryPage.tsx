
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Clock, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface QuizHistoryItem {
  id: string;
  flashcard_set_id: string;
  start_time: string;
  end_time: string;
  total_cards: number;
  correct_answers: number;
  total_score: number;
  duration_seconds: number;
  average_response_time: number;
  grade: string;
  flashcard_sets: {
    name: string;
    subject: string;
  };
}

const QuizHistoryPage = () => {
  const { userProfile } = useRequireAuth();
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  const { data: quizHistory, isLoading } = useQuery({
    queryKey: ['quiz-history', userProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          id,
          flashcard_set_id,
          start_time,
          end_time,
          total_cards,
          correct_answers,
          total_score,
          duration_seconds,
          average_response_time,
          grade,
          flashcard_sets!inner (
            name,
            subject
          )
        `)
        .eq('user_id', userProfile?.id)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as QuizHistoryItem[];
    },
    enabled: !!userProfile?.id
  });

  const filteredHistory = selectedSet 
    ? quizHistory?.filter(item => item.flashcard_set_id === selectedSet)
    : quizHistory;

  const uniqueSets = quizHistory?.reduce((acc, item) => {
    if (!acc.find(set => set.id === item.flashcard_set_id)) {
      acc.push({
        id: item.flashcard_set_id,
        name: item.flashcard_sets.name,
        subject: item.flashcard_sets.subject
      });
    }
    return acc;
  }, [] as Array<{ id: string; name: string; subject: string }>);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-mint-700 font-medium">Loading quiz history...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-mint-800">Quiz History</h1>
            <p className="text-muted-foreground">Track your quiz performance over time</p>
          </div>
        </div>

        {/* Filter by Set */}
        {uniqueSets && uniqueSets.length > 1 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSet === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSet(null)}
                className="mb-2"
              >
                All Sets
              </Button>
              {uniqueSets.map((set) => (
                <Button
                  key={set.id}
                  variant={selectedSet === set.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSet(set.id)}
                  className="mb-2"
                >
                  {set.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quiz History List */}
        {filteredHistory && filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((quiz) => (
              <Card key={quiz.id} className="border-mint-100">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-mint-800">
                        {quiz.flashcard_sets.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {quiz.flashcard_sets.subject} • {formatDistanceToNow(new Date(quiz.start_time), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={`${getGradeColor(quiz.grade)} font-bold text-lg px-3 py-1`}>
                      {quiz.grade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-mint-600" />
                      <div>
                        <div className="text-sm font-medium">{quiz.total_score}</div>
                        <div className="text-xs text-muted-foreground">Total Score</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">
                          {quiz.correct_answers}/{quiz.total_cards}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((quiz.correct_answers / quiz.total_cards) * 100)}% Correct
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">{formatTime(quiz.duration_seconds)}</div>
                        <div className="text-xs text-muted-foreground">Total Time</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium">
                          {quiz.average_response_time.toFixed(1)}s
                        </div>
                        <div className="text-xs text-muted-foreground">Avg. Time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-mint-100">
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-mint-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-mint-800 mb-2">No Quiz History</h3>
              <p className="text-muted-foreground mb-6">
                {selectedSet ? "No quizzes found for this set" : "You haven't completed any quizzes yet"}
              </p>
              <Button 
                onClick={() => navigate('/quiz')}
                className="bg-mint-500 hover:bg-mint-600 text-white"
              >
                Take Your First Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default QuizHistoryPage;
