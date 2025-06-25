
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Eye, 
  BookOpen, 
  Clock, 
  Users, 
  Calendar,
  Star,
  User,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

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

interface QuizPreviewModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (quizId: string) => void;
  isFavorite?: boolean;
}

export const QuizPreviewModal: React.FC<QuizPreviewModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite = false
}) => {
  if (!quiz) return null;

  const estimatedDuration = Math.max(1, Math.ceil(quiz.questionCount * 1.5)); // ~1.5 minutes per question

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-mint-800 line-clamp-2">
                {quiz.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-gray-600">
                {quiz.description || "No description available"}
              </DialogDescription>
            </div>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(quiz.id)}
                className="shrink-0 hover:bg-mint-50"
              >
                <Star 
                  className={`h-5 w-5 ${
                    isFavorite 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`} 
                />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-mint-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-mint-600" />
                </div>
                <div className="text-2xl font-bold text-mint-800">{quiz.questionCount}</div>
                <div className="text-xs text-gray-600">Questions</div>
              </CardContent>
            </Card>

            <Card className="border-mint-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-800">~{estimatedDuration}</div>
                <div className="text-xs text-gray-600">Minutes</div>
              </CardContent>
            </Card>

            <Card className="border-mint-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-800">Mixed</div>
                <div className="text-xs text-gray-600">Difficulty</div>
              </CardContent>
            </Card>

            <Card className="border-mint-100">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {quiz.is_public ? (
                    <Users className="h-5 w-5 text-green-600" />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {quiz.is_public ? 'Public' : 'Private'}
                </div>
                <div className="text-xs text-gray-600">Visibility</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Quiz Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Quiz Information</h3>
            
            <div className="grid gap-3">
              {quiz.academic_subjects?.name && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-20">Subject:</span>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {quiz.academic_subjects.name}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-20">Created:</span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-20">Type:</span>
                <Badge className={`${
                  quiz.questionCount <= 5 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : quiz.questionCount <= 15 
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {quiz.questionCount <= 5 ? 'Quick Quiz' : 
                   quiz.questionCount <= 15 ? 'Standard Quiz' : 'Comprehensive Quiz'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button asChild className="flex-1 bg-mint-600 hover:bg-mint-700">
              <Link to={`/quiz/${quiz.id}/take`} onClick={onClose}>
                <Play className="h-4 w-4 mr-2" />
                Take Quiz Now
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1 border-mint-200 text-mint-700 hover:bg-mint-50">
              <Link to={`/quiz/${quiz.id}`} onClick={onClose}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-mint-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-mint-600 mt-0.5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-mint-800 mb-1">Before you start:</h4>
                <ul className="text-sm text-mint-700 space-y-1">
                  <li>• Make sure you have enough time to complete the quiz</li>
                  <li>• Find a quiet environment to focus</li>
                  <li>• Have a pen and paper ready if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
