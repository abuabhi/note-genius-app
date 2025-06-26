
import React from 'react';
import { FlashcardSetListCard } from './FlashcardSetListCard';

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

interface FlashcardSetListViewProps {
  sets: FlashcardSet[];
  onTogglePinned?: (id: string, isPinned: boolean) => void;
  onDelete?: (id: string) => void;
  loading: boolean;
  currentUserId?: string;
}

export const FlashcardSetListView = ({
  sets,
  onTogglePinned,
  onDelete,
  loading,
  currentUserId
}: FlashcardSetListViewProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sets.map((set) => (
        <FlashcardSetListCard
          key={set.id}
          set={set}
          onTogglePinned={onTogglePinned}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};
