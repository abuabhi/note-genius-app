
import React from 'react';
import { Quiz } from '@/types/quiz';
import { QuizListCard } from './QuizListCard';

interface QuizListViewProps {
  quizzes: Quiz[];
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  favoriteQuizIds: Set<string>;
  loading: boolean;
  isSelectable: boolean;
  selectedQuizIds: Set<string>;
  onSelectionChange: (quizIds: Set<string>) => void;
  onRefresh: () => void;
  currentUserId?: string;
}

export const QuizListView = ({
  quizzes,
  onToggleFavorite,
  favoriteQuizIds,
  loading,
  isSelectable,
  selectedQuizIds,
  onSelectionChange,
  onRefresh,
  currentUserId
}: QuizListViewProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => (
        <QuizListCard
          key={quiz.id}
          quiz={quiz}
          onToggleFavorite={onToggleFavorite}
          favoriteQuizIds={favoriteQuizIds}
          onRefresh={onRefresh}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};
