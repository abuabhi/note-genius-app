
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Users, Clock, BookOpen, Star, StarOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface QuizCardProps {
  quiz: {
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
  };
  onToggleFavorite?: (quizId: string) => void;
  isFavorite?: boolean;
  showActions?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onToggleFavorite,
  isFavorite = false,
  showActions = true
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(quiz.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-mint-100 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-semibold text-mint-800 line-clamp-2 group-hover:text-mint-700 transition-colors">
                {quiz.title}
              </CardTitle>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteClick}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-mint-50"
                >
                  {isFavorite ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {quiz.description || "No description available"}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Quiz Info Badges */}
          <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" className="flex-1 bg-mint-600 hover:bg-mint-700">
                <Link to={`/quiz/${quiz.id}/take`}>
                  <Play className="h-4 w-4 mr-1" />
                  Take Quiz
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-mint-200 text-mint-700 hover:bg-mint-50">
                <Link to={`/quiz/${quiz.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          )}

          {/* Footer with timestamp */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
