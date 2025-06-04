
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useQuiz, useSubmitQuizResult } from "@/hooks/useQuizzes";
import { QuizTakingCard } from "@/components/quiz/QuizTaking/QuizTakingCard";
import { QuizResults } from "@/components/quiz/QuizTaking/QuizResults";
import { QuizTakingBreadcrumb } from "@/components/quiz/QuizTakingBreadcrumb";
import { QuizLoadingState } from "@/components/quiz/QuizTaking/QuizLoadingState";
import { QuizErrorState } from "@/components/quiz/QuizTaking/QuizErrorState";
import { QuizIntroduction } from "@/components/quiz/QuizTaking/QuizIntroduction";

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
    return <QuizLoadingState />;
  }
  
  if (error || !quiz) {
    return <QuizErrorState onBackToQuizzes={() => navigate('/quizzes')} />;
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
  
  if (quizState === 'not-started') {
    return <QuizIntroduction quiz={quiz} onStartQuiz={startQuiz} />;
  }
  
  if (quizState === 'in-progress' && quiz.questions) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <QuizTakingBreadcrumb quizTitle={quiz.title} />
            </div>
            <QuizTakingCard
              questions={quiz.questions}
              onQuizComplete={handleQuizComplete}
            />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (quizState === 'completed' && quizResults) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="container mx-auto p-6">
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
          </div>
        </div>
      </Layout>
    );
  }
  
  return null;
};

export default TakeQuizPage;
