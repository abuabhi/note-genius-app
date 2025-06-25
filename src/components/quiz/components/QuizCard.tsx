
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Eye, 
  Users, 
  Clock, 
  BookOpen, 
  Star, 
  StarOff,
  Search,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { QuizPreviewModal } from './QuizPreviewModal';
import { QuizActionsMenu } from './QuizActionsMenu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuizCardProps {
  quiz: {
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
  };
  onToggleFavorite?: (quizId: string) => void;
  isFavorite?: boolean;
  showActions?: boolean;
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
  showActions = true,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
  onRefresh,
  currentUserId
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(quiz.id);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewOpen(true);
  };

  const handleCardClick = () => {
    if (!isSelectable) {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  const handleSelectionChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange?.(quiz.id, !isSelected);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const estimatedDuration = Math.max(1, Math.ceil(quiz.questionCount * 1.5));

  return (
    <TooltipProvider>
      <Card 
        className={`group hover:shadow-lg transition-all duration-300 border-mint-100 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02] transform ${
          !isSelectable ? 'cursor-pointer' : ''
        } ${isSelected ? 'ring-2 ring-mint-500' : ''}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={!isSelectable ? 0 : -1}
        role={!isSelectable ? "button" : undefined}
        aria-label={!isSelectable ? `View quiz: ${quiz.title}` : undefined}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {isSelectable && (
                <Checkbox
                  checked={isSelected}
                  onChange={handleSelectionChange}
                  onClick={handleSelectionChange}
                  className="mt-1 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold text-mint-800 line-clamp-2 group-hover:text-mint-700 transition-colors">
                    {quiz.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onToggleFavorite && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleFavoriteClick}
                            className="h-8 w-8 p-0 hover:bg-mint-50 transition-colors"
                          >
                            {isFavorite ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-400 hover:text-yellow-500 transition-colors" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <QuizActionsMenu 
                      quiz={quiz}
                      currentUserId={currentUserId}
                      onRefresh={onRefresh}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {quiz.description || "No description available"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Quiz Info Badges */}
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="flex items-center gap-1 bg-mint-50 text-mint-700 border-mint-200">
                    <BookOpen className="h-3 w-3" />
                    {quiz.questionCount} questions
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This quiz contains {quiz.questionCount} questions</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                    <Clock className="h-3 w-3" />
                    ~{estimatedDuration} min
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated completion time: {estimatedDuration} minutes</p>
                </TooltipContent>
              </Tooltip>
              
              {quiz.academic_subjects?.name && (
                <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                  {quiz.academic_subjects.name}
                </Badge>
              )}
              
              {quiz.is_public && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
                      <Users className="h-3 w-3" />
                      Public
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This quiz is publicly available</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="sm" className="flex-1 bg-mint-600 hover:bg-mint-700 transition-colors">
                      <Link to={`/quiz/${quiz.id}/take`}>
                        <Play className="h-4 w-4 mr-1" />
                        Take Quiz
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start taking this quiz now (Shortcut: Enter)</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviewClick}
                        className="border-mint-200 text-mint-700 hover:bg-mint-50 transition-colors"
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quick preview of quiz details</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="sm" className="border-mint-200 text-mint-700 hover:bg-mint-50 transition-colors">
                        <Link to={`/quiz/${quiz.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View detailed quiz information</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {/* Footer with timestamp */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
              </div>
              {!isSelectable && (
                <div className="flex items-center gap-1 text-mint-600">
                  <Info className="h-3 w-3" />
                  <span className="text-xs">Click to view details</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Preview Modal */}
        <QuizPreviewModal
          quiz={quiz}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
        />
      </Card>
    </TooltipProvider>
  );
};
