
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizHistoryHeader } from "@/components/quiz/history/QuizHistoryHeader";
import { QuizHistoryFilters } from "@/components/quiz/history/QuizHistoryFilters";
import { QuizHistoryList } from "@/components/quiz/history/QuizHistoryList";
import { EmptyQuizHistory } from "@/components/quiz/history/EmptyQuizHistory";
import { QuizHistoryError } from "@/components/quiz/history/QuizHistoryError";
import { QuizHistoryLoading } from "@/components/quiz/history/QuizHistoryLoading";
import { QuizHistoryBreadcrumb } from "@/components/quiz/history/QuizHistoryBreadcrumb";
import { useQuizHistoryData } from "@/hooks/quiz/useQuizHistoryData";

const QuizHistoryPage = () => {
  const { userProfile } = useRequireAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'all' | 'quizzes' | 'flashcard_quizzes'>('all');

  const {
    quizResults,
    quizSessions,
    isLoading,
    hasError,
    quizResultsError,
    quizSessionsError
  } = useQuizHistoryData(userProfile?.id);

  const filteredQuizResults = selectedType === 'flashcard_quizzes' ? [] : (quizResults || []);
  const filteredQuizSessions = selectedType === 'quizzes' ? [] : (quizSessions || []);
  
  const hasAnyHistory = (filteredQuizResults.length > 0) || (filteredQuizSessions.length > 0);

  if (hasError) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <QuizHistoryBreadcrumb />
            </div>
            <QuizHistoryError 
              error={quizResultsError?.message || quizSessionsError?.message || 'Failed to load quiz history'} 
            />
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <QuizHistoryBreadcrumb />
            </div>
            <QuizHistoryLoading />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <QuizHistoryBreadcrumb />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/quizzes')}
              className="flex items-center gap-2 hover:bg-mint-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quizzes
            </Button>
            <QuizHistoryHeader />
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-mint-100 rounded-lg p-6 mb-6">
            <QuizHistoryFilters
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              quizResultsCount={quizResults?.length || 0}
              quizSessionsCount={quizSessions?.length || 0}
            />
          </div>

          {hasAnyHistory ? (
            <QuizHistoryList
              quizResults={filteredQuizResults}
              quizSessions={filteredQuizSessions}
            />
          ) : (
            <EmptyQuizHistory onNavigateToQuiz={() => navigate('/quizzes')} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizHistoryPage;
