import React from 'react';
import { StandardListCard } from '@/components/ui/StandardListCard';
import { Quiz } from '@/types/quiz';
import { Play, MessageCircle, Calendar, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuizActionsMenu } from './QuizActionsMenu';
import { getSubjectColorClasses } from '@/utils/subjectColors';

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
      icon: <MessageCircle className="h-3.5 w-3.5" />,
      label: `${questionCount} question${questionCount === 1 ? '' : 's'}`
    },
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: formattedDate
    }
  ];

  if (!isOwner) {
    metadata.push({
      icon: <User className="h-3.5 w-3.5" />,
      label: 'Public'
    });
  }

  if (isFavorite) {
    metadata.push({
      icon: <Heart className="h-3.5 w-3.5 fill-current text-red-500" />,
      label: 'Favorite'
    });
  }

  // Create a compatible quiz object for the actions menu
  const quizForActions = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    is_public: quiz.is_public,
    created_at: quiz.created_at,
    questionCount: quiz.questionCount || 0,
    user_id: quiz.user_id,
    academic_subjects: quiz.academic_subjects,
  };

  // Create description with proper "..." truncation
  const description = quiz.description ? 
    (quiz.description.length > 140 ? quiz.description.substring(0, 137) + '...' : quiz.description) 
    : undefined;

  return (
    <StandardListCard
      title={quiz.title}
      description={description}
      subjectName={subjectName}
      subjectBadgeColor={getSubjectColorClasses(subjectName)}
      primaryAction={{
        label: "Take Quiz",
        onClick: handleTakeQuiz,
        icon: <Play className="h-3.5 w-3.5 mr-1.5" />,
        className: "bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-4 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      }}
      menuActions={
        <QuizActionsMenu
          quiz={quizForActions}
          currentUserId={currentUserId}
          onRefresh={onRefresh}
        />
      }
      metadata={metadata}
      onClick={handleQuizClick}
      isPinned={false}
    />
  );
};
