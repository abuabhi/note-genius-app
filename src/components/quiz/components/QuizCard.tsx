
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Eye, Users, Clock, BookOpen, Star, StarOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchTakeQuizChunk, prefetchQuizDetails } from '@/lib/quizPrefetch';
import { QuizActionsMenu } from './QuizActionsMenu';

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

interface QuizCardProps {
  quiz: Quiz;
  onToggleFavorite?: (quizId: string) => void;
  isFavorite?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (quizId: string, selected: boolean) => void;
  onRefresh?: () => void;
  currentUserId?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onToggleFavorite,
  isFavorite = false,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
  onRefresh,
  currentUserId
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!isSelectable) {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(quiz.id);
  };

  const handleSelectionChange = (checked: boolean) => {
    onSelectionChange?.(quiz.id, checked);
  };

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 border-mint-100 bg-white/80 backdrop-blur-sm ${
        !isSelectable ? 'cursor-pointer' : ''
      } ${isSelected ? 'ring-2 ring-mint-500' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isSelectable && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectionChange}
                className="flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-mint-800 line-clamp-2 group-hover:text-mint-700 transition-colors">
                {quiz.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {quiz.description || "No description available"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="h-8 w-8 p-0 hover:bg-mint-50"
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                )}
              </Button>
            )}
            <QuizActionsMenu 
              quiz={quiz}
              currentUserId={currentUserId}
              onRefresh={onRefresh}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1 bg-mint-50 text-mint-700 border-mint-200">
            <BookOpen className="h-3 w-3" />
            {quiz.questionCount} questions
          </Badge>
          
          {quiz.academic_subjects?.name && (
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              {quiz.academic_subjects.name}
            </Badge>
          )}
          
          {quiz.is_public && (
            <Badge className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
              <Users className="h-3 w-3" />
              Public
            </Badge>
          )}
          
          <Badge variant="outline" className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-mint-600 hover:bg-mint-700">
            <Link to={`/quiz/${quiz.id}/take`} onMouseEnter={warmTakeQuiz} onFocus={warmTakeQuiz} onTouchStart={warmTakeQuiz}>
              <Play className="h-4 w-4 mr-2" />
              Take Quiz
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-mint-200 text-mint-700 hover:bg-mint-50">
            <Link to={`/quiz/${quiz.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
