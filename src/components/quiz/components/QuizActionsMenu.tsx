
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Share, 
  Trash2, 
  Eye,
  BarChart3 
} from 'lucide-react';
import { UnifiedDeleteDialog } from '@/components/ui/unified/UnifiedDeleteDialog';
import { useNavigate } from 'react-router-dom';

interface QuizActionsMenuQuiz {
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

interface QuizActionsMenuProps {
  quiz: QuizActionsMenuQuiz;
  currentUserId?: string;
  onRefresh?: () => void;
}

export const QuizActionsMenu: React.FC<QuizActionsMenuProps> = ({ 
  quiz, 
  currentUserId,
  onRefresh 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const isOwner = currentUserId && quiz.user_id === currentUserId;

  const handleView = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  const handleEdit = () => {
    navigate(`/quiz/${quiz.id}/edit`);
  };

  const handleDuplicate = () => {
    // TODO: Implement duplication functionality
    console.log('Duplicate quiz:', quiz.id);
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Share quiz:', quiz.id);
  };

  const handleAnalytics = () => {
    navigate(`/quiz/${quiz.id}/analytics`);
  };

  const handleDeleteSuccess = () => {
    onRefresh?.();
  };

  const handleDelete = async () => {
    // TODO: Implement actual delete functionality
    console.log('Delete quiz:', quiz.id);
    handleDeleteSuccess();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-mint-50"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          
          {isOwner && (
            <>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Quiz
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAnalytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Quiz
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UnifiedDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        itemName={quiz.title}
        itemType="quiz"
        description={`Are you sure you want to delete "${quiz.title}"? This action cannot be undone. All quiz results and data will be permanently removed.`}
      />
    </>
  );
};
