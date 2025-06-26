
import React from 'react';
import { StandardListCard } from '@/components/ui/StandardListCard';
import { Quiz } from '@/types/quiz';
import { Play, MessageCircle, Clock, Calendar, User, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { QuizActionsMenu } from './QuizActionsMenu';

interface QuizListCardProps {
  quiz: Quiz;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  favoriteQuizIds?: Set<string>;
  onRefresh?: () => void;
  currentUserId?: string;
}

export const QuizListCard = ({
  quiz,
  onToggleFavorite,
  favoriteQuizIds = new Set(),
  onRefresh,
  currentUserId
}: QuizListCardProps) => {
  const navigate = useNavigate();
  
  const handleTakeQuiz = () => {
    navigate(`/quiz/${quiz.id}/take`);
  };

  const handleQuizClick = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  const subjectName = quiz.academic_subjects?.name || 'General';
  const questionCount = quiz.questionCount || 0;
  const isOwner = currentUserId === quiz.user_id;
  const isFavorite = favoriteQuizIds.has(quiz.id);
  
  const createdDate = new Date(quiz.created_at);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(createdDate);

  const metadata = [
    {
      icon: <MessageCircle className="h-3 w-3" />,
      label: `${questionCount} question${questionCount === 1 ? '' : 's'}`
    },
    {
      icon: <Calendar className="h-3 w-3" />,
      label: formattedDate
    }
  ];

  if (!isOwner) {
    metadata.push({
      icon: <User className="h-3 w-3" />,
      label: 'Public'
    });
  }

  if (isFavorite) {
    metadata.push({
      icon: <Heart className="h-3 w-3 fill-current text-red-500" />,
      label: 'Favorite',
      className: 'text-red-500'
    });
  }

  return (
    <StandardListCard
      title={quiz.title}
      subjectName={subjectName}
      subjectBadgeColor="bg-blue-100 text-blue-700"
      primaryAction={{
        label: "Take Quiz",
        onClick: handleTakeQuiz,
        icon: <Play className="h-3 w-3 mr-1" />,
        className: "bg-mint-600 hover:bg-mint-700 text-white px-3 py-1 h-7 text-xs"
      }}
      menuActions={
        <QuizActionsMenu
          quiz={quiz}
          currentUserId={currentUserId}
          onRefresh={onRefresh}
        />
      }
      metadata={metadata}
      onClick={handleQuizClick}
      secondaryActions={
        quiz.description && (
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {quiz.description}
          </div>
        )
      }
    />
  );
};
