
import React, { useState } from 'react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Pin,
  PinOff,
  Play
} from 'lucide-react';
import { UnifiedDeleteDialog } from '@/components/ui/unified/UnifiedDeleteDialog';
import { useNavigate } from 'react-router-dom';

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

interface FlashcardSetActionsMenuProps {
  set: FlashcardSet;
  onTogglePinned?: (id: string, isPinned: boolean) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
}

export const FlashcardSetActionsMenu = ({
  set,
  onTogglePinned,
  onDelete,
  currentUserId
}: FlashcardSetActionsMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const isOwner = currentUserId === set.user_id;
  const canEdit = isOwner && !set.is_built_in;

  const handleView = () => {
    navigate(`/flashcards/${set.id}`);
  };

  const handleEdit = () => {
    navigate(`/flashcards/${set.id}/edit`);
  };

  const handleStudy = () => {
    navigate(`/flashcards/${set.id}/study`);
  };

  const handleTogglePin = () => {
    if (onTogglePinned) {
      onTogglePinned(set.id, !set.is_pinned);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(set.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenuItem onClick={handleView}>
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </DropdownMenuItem>
      
      <DropdownMenuItem onClick={handleStudy}>
        <Play className="h-4 w-4 mr-2" />
        Study Cards
      </DropdownMenuItem>
      
      {canEdit && (
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Set
        </DropdownMenuItem>
      )}
      
      {onTogglePinned && (
        <DropdownMenuItem onClick={handleTogglePin}>
          {set.is_pinned ? (
            <>
              <PinOff className="h-4 w-4 mr-2" />
              Unpin
            </>
          ) : (
            <>
              <Pin className="h-4 w-4 mr-2" />
              Pin
            </>
          )}
        </DropdownMenuItem>
      )}
      
      {canEdit && onDelete && (
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
            Delete Set
          </DropdownMenuItem>
        </>
      )}

      <UnifiedDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Flashcard Set"
        itemName={set.name}
        itemType="flashcard set"
        description={`Are you sure you want to delete "${set.name}"? This action cannot be undone and will remove all ${set.card_count} flashcards in this set.`}
      />
    </>
  );
};
