import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { QuizCard } from './QuizCard';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  questionCount: number;
  user_id?: string;
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
  isSelectable?: boolean;
  selectedQuizIds?: Set<string>;
  onSelectionChange?: (quizId: string, selected: boolean) => void;
  onRefresh?: () => void;
  currentUserId?: string;
}

const VIRTUALIZATION_THRESHOLD = 20;
const CARD_HEIGHT = 220;
const CARD_GAP = 24;

export const QuizGrid: React.FC<QuizGridProps> = ({
  quizzes,
  onToggleFavorite,
  favoriteQuizIds = new Set(),
  loading = false,
  isSelectable = false,
  selectedQuizIds = new Set(),
  onSelectionChange,
  onRefresh,
  currentUserId
}) => {
  const shouldVirtualize = quizzes.length > VIRTUALIZATION_THRESHOLD;

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

  // Use virtualization for large lists
  if (shouldVirtualize) {
    const columnCount = 3;
    const rowCount = Math.ceil(quizzes.length / columnCount);
    
    const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= quizzes.length) return null;
      
      const quiz = quizzes[index];
      return (
        <div style={{ ...style, padding: CARD_GAP / 2 }}>
          <QuizCard
            quiz={quiz}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favoriteQuizIds.has(quiz.id)}
            isSelectable={isSelectable}
            isSelected={selectedQuizIds.has(quiz.id)}
            onSelectionChange={onSelectionChange}
            onRefresh={onRefresh}
            currentUserId={currentUserId}
          />
        </div>
      );
    };

    return (
      <div className="relative">
        <div className="text-xs text-gray-400 mb-2">
          Showing {quizzes.length} quizzes (virtualized for performance)
        </div>
        <Grid
          columnCount={columnCount}
          columnWidth={380}
          height={600}
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT + CARD_GAP}
          width={1200}
          className="scrollbar-thin"
        >
          {Cell}
        </Grid>
      </div>
    );
  }

  // Standard grid for smaller lists
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteQuizIds.has(quiz.id)}
          isSelectable={isSelectable}
          isSelected={selectedQuizIds.has(quiz.id)}
          onSelectionChange={onSelectionChange}
          onRefresh={onRefresh}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};
