
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useQuiz, useSubmitQuizResult } from "@/hooks/useQuizzes";
import { Button } from "@/components/ui/button";
import { QuizTakingCard } from "@/components/quiz/QuizTaking/QuizTakingCard";
import { QuizResults } from "@/components/quiz/QuizTaking/QuizResults";
import { ArrowLeft } from "lucide-react";

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
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <p>Loading quiz...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !quiz) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-2">Quiz not found</h1>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/quiz')}>
              Back to Quizzes
            </Button>
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
      <div className="container mx-auto p-6">
        {quizState === 'not-started' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8" 
                onClick={() => navigate('/quiz')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-3xl font-bold">{quiz.title}</h1>
            </div>
            
            {quiz.description && (
              <p className="text-muted-foreground mb-6">{quiz.description}</p>
            )}
            
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
                <p className="text-muted-foreground">
                  This quiz has {quiz.questions?.length || 0} questions.
                </p>
              </div>
              
              <Button size="lg" onClick={startQuiz}>
                Start Quiz
              </Button>
            </div>
          </div>
        )}
        
        {quizState === 'in-progress' && quiz.questions && (
          <QuizTakingCard
            questions={quiz.questions}
            onQuizComplete={handleQuizComplete}
          />
        )}
        
        {quizState === 'completed' && quizResults && (
          <QuizResults
            quiz={quiz}
            score={quizResults.score}
            totalQuestions={quizResults.totalQuestions}
            duration={quizResults.duration}
            onRetry={restartQuiz}
          />
        )}
      </div>
    </Layout>
  );
};

export default TakeQuizPage;
