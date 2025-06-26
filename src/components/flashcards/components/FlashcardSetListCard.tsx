import React from 'react';
import { StandardListCard } from '@/components/ui/StandardListCard';
import { Play, CreditCard, Calendar, User, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FlashcardSetActionsMenu } from './FlashcardSetActionsMenu';
import { getSubjectColorClasses } from '@/utils/subjectColors';

interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  subject: string;
  card_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_built_in: boolean;
  is_pinned?: boolean;
}

interface FlashcardSetListCardProps {
  set: FlashcardSet;
  onTogglePinned?: (id: string, isPinned: boolean) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

export const FlashcardSetListCard = ({
  set,
  onTogglePinned,
  onDelete,
  currentUserId
}: FlashcardSetListCardProps) => {
  const navigate = useNavigate();
  
  const handleStudySet = () => {
    navigate(`/flashcards/${set.id}/study`);
  };

  const handleSetClick = () => {
    navigate(`/flashcards/${set.id}`);
  };

  const isOwner = currentUserId === set.user_id;
  const createdDate = new Date(set.created_at);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(createdDate);

  const metadata = [
    {
      icon: <CreditCard className="h-3.5 w-3.5" />,
      label: `${set.card_count} card${set.card_count === 1 ? '' : 's'}`
    },
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: formattedDate
    }
  ];

  if (set.is_built_in) {
    metadata.push({
      icon: <Star className="h-3.5 w-3.5" />,
      label: 'Built-in'
    });
  } else if (!isOwner) {
    metadata.push({
      icon: <User className="h-3.5 w-3.5" />,
      label: 'Shared'
    });
  }

  // Create description with proper "..." truncation
  const description = set.description ? 
    (set.description.length > 140 ? set.description.substring(0, 137) + '...' : set.description) 
    : undefined;

  return (
    <StandardListCard
      title={set.name}
      description={description}
      subjectName={set.subject}
      subjectBadgeColor={getSubjectColorClasses(set.subject)}
      primaryAction={{
        label: "Study",
        onClick: handleStudySet,
        icon: <Play className="h-3.5 w-3.5 mr-1.5" />,
        className: "bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-4 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      }}
      menuActions={
        <FlashcardSetActionsMenu
          set={set}
          onTogglePinned={onTogglePinned}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      }
      metadata={metadata}
      onClick={handleSetClick}
      isPinned={set.is_pinned}
    />
  );
};
