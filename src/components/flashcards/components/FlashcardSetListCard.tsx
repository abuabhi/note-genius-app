
import React from 'react';
import { StandardListCard } from '@/components/ui/StandardListCard';
import { Play, CreditCard, Calendar, User, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
      icon: <CreditCard className="h-3 w-3" />,
      label: `${set.card_count} card${set.card_count === 1 ? '' : 's'}`
    },
    {
      icon: <Calendar className="h-3 w-3" />,
      label: formattedDate
    }
  ];

  if (set.is_built_in) {
    metadata.push({
      icon: <Star className="h-3 w-3" />,
      label: 'Built-in'
    });
  } else if (!isOwner) {
    metadata.push({
      icon: <User className="h-3 w-3" />,
      label: 'Shared'
    });
  }

  return (
    <StandardListCard
      title={set.name}
      subjectName={set.subject}
      subjectBadgeColor="bg-purple-100 text-purple-700"
      primaryAction={{
        label: "Study",
        onClick: handleStudySet,
        icon: <Play className="h-3 w-3 mr-1" />,
        className: "bg-mint-600 hover:bg-mint-700 text-white px-3 py-1 h-7 text-xs"
      }}
      metadata={metadata}
      onClick={handleSetClick}
      isPinned={set.is_pinned}
      secondaryActions={
        set.description && (
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {set.description}
          </div>
        )
      }
    />
  );
};
