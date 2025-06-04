
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

interface QuizResultItem {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  duration_seconds: number | null;
  completed_at: string;
  quiz: {
    title: string;
    description: string | null;
  };
}

interface QuizSessionItem {
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
  flashcard_set: {
    name: string;
    subject: string;
  };
}

const QuizHistoryPage = () => {
  const { userProfile } = useRequireAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'all' | 'quizzes' | 'flashcard_quizzes'>('all');

  // Fetch traditional quiz results with better error handling
  const { data: quizResults, isLoading: isLoadingQuizResults, error: quizResultsError } = useQuery({
    queryKey: ['quiz-results', userProfile?.id],
    queryFn: async () => {
      console.log('Fetching quiz results for user:', userProfile?.id);
      
      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser?.user?.id;
      
      if (!userId) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          total_questions,
          duration_seconds,
          completed_at,
          quiz:quizzes(
            title,
            description
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz results:', error);
        throw error;
      }
      
      console.log('Quiz results fetched:', data?.length || 0);
      return data as QuizResultItem[];
    },
    enabled: !!userProfile?.id,
    retry: 3,
    retryDelay: 1000
  });

  // Fetch flashcard quiz sessions with fixed query to avoid schema cache issue
  const { data: quizSessions, isLoading: isLoadingSessions, error: quizSessionsError } = useQuery({
    queryKey: ['quiz-sessions', userProfile?.id],
    queryFn: async () => {
      console.log('Fetching quiz sessions for user:', userProfile?.id);
      
      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser?.user?.id;
      
      if (!userId) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }
      
      // Fixed query that avoids the relationship error
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
          mode
        `)
        .eq('user_id', userId)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching quiz sessions:', error);
        throw error;
      }
      
      console.log('Quiz sessions fetched:', data?.length || 0);
      
      // Now make a separate call to get flashcard set details
      const enhancedData = await Promise.all(data.map(async (session) => {
        // Fetch the flashcard set details separately
        const { data: setData, error: setError } = await supabase
          .from('flashcard_sets')
          .select('name, subject')
          .eq('id', session.flashcard_set_id)
          .single();
          
        if (setError) {
          console.warn('Could not fetch flashcard set details for session:', session.id, setError);
          return {
            ...session,
            flashcard_set: {
              name: 'Unknown Set',
              subject: 'Unknown Subject'
            }
          };
        }
        
        return {
          ...session,
          flashcard_set: setData
        };
      }));
      
      return enhancedData as QuizSessionItem[];
    },
    enabled: !!userProfile?.id,
    retry: 3,
    retryDelay: 1000
  });

  const isLoading = isLoadingQuizResults || isLoadingSessions;
  const hasError = quizResultsError || quizSessionsError;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGradeFromScore = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
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

  if (hasError) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Trophy className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Quiz History</h3>
              <p className="text-red-600 mb-4">
                {quizResultsError?.message || quizSessionsError?.message || 'Failed to load quiz history'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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

  const filteredQuizResults = selectedType === 'flashcard_quizzes' ? [] : (quizResults || []);
  const filteredQuizSessions = selectedType === 'quizzes' ? [] : (quizSessions || []);
  
  const hasAnyHistory = (filteredQuizResults.length > 0) || (filteredQuizSessions.length > 0);

  console.log('Rendering quiz history:', {
    quizResults: quizResults?.length || 0,
    quizSessions: quizSessions?.length || 0,
    selectedType,
    hasAnyHistory,
    sessions: quizSessions
  });

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

        {/* Filter by Type */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="mb-2"
            >
              All Quizzes ({(quizResults?.length || 0) + (quizSessions?.length || 0)})
            </Button>
            <Button
              variant={selectedType === 'quizzes' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType('quizzes')}
              className="mb-2"
            >
              Traditional Quizzes ({quizResults?.length || 0})
            </Button>
            <Button
              variant={selectedType === 'flashcard_quizzes' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType('flashcard_quizzes')}
              className="mb-2"
            >
              Flashcard Quizzes ({quizSessions?.length || 0})
            </Button>
          </div>
        </div>

        {/* Quiz History List */}
        {hasAnyHistory ? (
          <div className="space-y-4">
            {/* Traditional Quiz Results */}
            {filteredQuizResults.map((quiz) => {
              const grade = getGradeFromScore(quiz.score, quiz.total_questions);
              const percentage = Math.round((quiz.score / quiz.total_questions) * 100);
              
              return (
                <Card key={quiz.id} className="border-mint-100">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-mint-800">
                          {quiz.quiz?.title || 'Quiz'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Traditional Quiz • {formatDistanceToNow(new Date(quiz.completed_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className={`${getGradeColor(grade)} font-bold text-lg px-3 py-1`}>
                        {grade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-mint-600" />
                        <div>
                          <div className="text-sm font-medium">{quiz.score}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm font-medium">
                            {quiz.score}/{quiz.total_questions}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage}% Correct
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium">
                            {quiz.duration_seconds ? formatTime(quiz.duration_seconds) : '--'}
                          </div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="text-sm font-medium">{quiz.total_questions}</div>
                          <div className="text-xs text-muted-foreground">Questions</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Flashcard Quiz Sessions */}
            {filteredQuizSessions.map((quiz) => (
              <Card key={quiz.id} className="border-mint-100">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-mint-800">
                        {quiz.flashcard_set?.name || 'Flashcard Quiz'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {quiz.flashcard_set?.subject || 'Study'} • {formatDistanceToNow(new Date(quiz.start_time), { addSuffix: true })}
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
                You haven't completed any quizzes yet
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
