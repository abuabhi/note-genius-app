
import React from 'react';
import { QuizCard } from './QuizCard';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  questionCount: number;
  academic_subjects?: {
    id: string;
    name: string;
  } | null;
}

interface QuizGridProps {
  quizzes: Quiz[];
  onToggleFavorite?: (quizId: string) => void;
  favoriteQuizIds?: Set<string>;
  loading?: boolean;
}

export const QuizGrid: React.FC<QuizGridProps> = ({
  quizzes,
  onToggleFavorite,
  favoriteQuizIds = new Set(),
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg border border-mint-100 p-6">
              <div className="space-y-4">
                <div className="h-6 bg-mint-100 rounded w-3/4"></div>
                <div className="h-4 bg-mint-100 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-mint-100 rounded w-20"></div>
                  <div className="h-6 bg-mint-100 rounded w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-mint-100 rounded flex-1"></div>
                  <div className="h-8 bg-mint-100 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteQuizIds.has(quiz.id)}
        />
      ))}
    </div>
  );
};
