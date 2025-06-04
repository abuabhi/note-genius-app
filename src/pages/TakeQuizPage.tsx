
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useQuiz, useSubmitQuizResult } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizTakingCard } from "@/components/quiz/QuizTaking/QuizTakingCard";
import { QuizResults } from "@/components/quiz/QuizTaking/QuizResults";
import { QuizTakingBreadcrumb } from "@/components/quiz/QuizTakingBreadcrumb";
import { ArrowLeft, Clock, HelpCircle, Award } from "lucide-react";

const TakeQuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useRequireAuth();
  const { data: quiz, isLoading, error } = useQuiz(quizId);
  const submitResult = useSubmitQuizResult();
  
  const [quizState, setQuizState] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [quizResults, setQuizResults] = useState<{
    score: number;
    totalQuestions: number;
    responses: any[];
    duration?: number;
  } | null>(null);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <QuizTakingBreadcrumb />
            </div>
            <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
              <CardContent className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-mint-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 w-32 bg-mint-200 rounded mx-auto"></div>
                  </div>
                  <p className="text-mint-600 mt-4">Loading quiz...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !quiz) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <QuizTakingBreadcrumb />
            </div>
            <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
              <CardContent className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <HelpCircle className="h-16 w-16 text-mint-400 mb-4" />
                <h1 className="text-2xl font-bold text-mint-800 mb-2">Quiz not found</h1>
                <p className="text-mint-600 mb-6 max-w-md">
                  The quiz you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => navigate('/quizzes')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  const startQuiz = () => {
    setQuizState('in-progress');
  };
  
  const handleQuizComplete = async (results: {
    score: number;
    totalQuestions: number;
    responses: any[];
    duration?: number;
  }) => {
    setQuizResults(results);
    setQuizState('completed');
    
    // Save the results to the database
    try {
      await submitResult.mutateAsync({
        quizId: quiz.id,
        score: results.score,
        totalQuestions: results.totalQuestions,
        duration: results.duration,
        responses: results.responses
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };
  
  const restartQuiz = () => {
    setQuizState('in-progress');
    setQuizResults(null);
  };
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6">
          {quizState === 'not-started' && (
            <>
              <div className="mb-6">
                <QuizTakingBreadcrumb quizTitle={quiz.title} />
              </div>
              
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-8 w-8 hover:bg-mint-50" 
                        onClick={() => navigate('/quizzes')}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                      </Button>
                      <CardTitle className="text-3xl text-mint-800">{quiz.title}</CardTitle>
                    </div>
                    {quiz.description && (
                      <p className="text-mint-600 text-lg">{quiz.description}</p>
                    )}
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                    <CardContent className="p-6 text-center">
                      <HelpCircle className="h-8 w-8 text-mint-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-mint-800 mb-2">Questions</h3>
                      <p className="text-2xl font-bold text-mint-700">{quiz.questions?.length || 0}</p>
                      <p className="text-sm text-mint-600">Multiple choice</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 text-mint-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-mint-800 mb-2">Duration</h3>
                      <p className="text-2xl font-bold text-mint-700">~{Math.ceil((quiz.questions?.length || 0) * 1.5)}</p>
                      <p className="text-sm text-mint-600">minutes</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 text-mint-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-mint-800 mb-2">Format</h3>
                      <p className="text-2xl font-bold text-mint-700">Quiz</p>
                      <p className="text-sm text-mint-600">Formal assessment</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-mint-800 mb-2">Ready to Start?</h2>
                      <p className="text-mint-600 max-w-md">
                        Take your time and read each question carefully. You'll see the correct answers after each question.
                      </p>
                    </div>
                    
                    <Button size="lg" onClick={startQuiz} className="bg-mint-600 hover:bg-mint-700 text-white px-8 py-3">
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {quizState === 'in-progress' && quiz.questions && (
            <>
              <div className="mb-6">
                <QuizTakingBreadcrumb quizTitle={quiz.title} />
              </div>
              <QuizTakingCard
                questions={quiz.questions}
                onQuizComplete={handleQuizComplete}
              />
            </>
          )}
          
          {quizState === 'completed' && quizResults && (
            <>
              <div className="mb-6">
                <QuizTakingBreadcrumb quizTitle={quiz.title} />
              </div>
              <QuizResults
                quiz={quiz}
                score={quizResults.score}
                totalQuestions={quizResults.totalQuestions}
                duration={quizResults.duration}
                onRetry={restartQuiz}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TakeQuizPage;
