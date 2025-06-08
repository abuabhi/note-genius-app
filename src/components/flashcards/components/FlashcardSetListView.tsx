
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Star, StarOff, MoreHorizontal, Trash2 } from 'lucide-react';
import { FlashcardSet } from '@/types/flashcard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface FlashcardSetListViewProps {
  sets: FlashcardSet[];
  onDeleteSet: (setId: string) => void;
  onTogglePinned?: (setId: string, isPinned: boolean) => void;
  deletingSet: string | null;
  detailedProgressData?: Record<string, {
    masteredCards: number;
    needsPracticeCards: number;
    totalCards: number;
    masteredPercentage: number;
  }>;
}

const FlashcardSetListView = ({
  sets,
  onDeleteSet,
  onTogglePinned,
  deletingSet,
  detailedProgressData = {},
}: FlashcardSetListViewProps) => {
  const [optimisticPinnedSets, setOptimisticPinnedSets] = useState<Set<string>>(new Set());

  const handleTogglePinned = (setId: string, currentlyPinned: boolean) => {
    // Optimistic update
    const newPinnedSets = new Set(optimisticPinnedSets);
    if (currentlyPinned) {
      newPinnedSets.delete(setId);
    } else {
      newPinnedSets.add(setId);
    }
    setOptimisticPinnedSets(newPinnedSets);
    
    onTogglePinned?.(setId, !currentlyPinned);
  };

  const isSetPinned = (setId: string) => {
    return optimisticPinnedSets.has(setId);
  };

  if (sets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl p-8 max-w-md mx-auto">
          <BookOpen className="h-16 w-16 text-mint-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-mint-900 mb-2">No flashcard sets found</h3>
          <p className="text-mint-700 mb-6">Create your first flashcard set to start studying!</p>
          <Button asChild>
            <Link to="/flashcards/create">
              Create Your First Set
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sets.map((set) => {
        const progress = detailedProgressData[set.id];
        const isPinned = isSetPinned(set.id);
        const isDeleting = deletingSet === set.id;

        return (
          <div
            key={set.id}
            className={`group bg-white border border-mint-100 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
              isPinned ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''
            } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center justify-between">
              {/* Left side - Set info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {isPinned && <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />}
                  <h3 className="font-semibold text-mint-800 truncate">{set.name}</h3>
                  {set.subject && (
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700 flex-shrink-0">
                      {set.subject}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {progress?.totalCards || set.card_count || 0} cards
                  </span>
                  
                  {progress && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {progress.masteredPercentage}% mastered
                    </span>
                  )}
                  
                  <span className="text-xs">
                    Updated {formatDistanceToNow(new Date(set.updated_at || set.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  className="bg-mint-500 hover:bg-mint-600"
                  asChild
                >
                  <Link to={`/flashcards/${set.id}/study`}>
                    <Play className="h-3 w-3 mr-1" />
                    Study
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTogglePinned(set.id, isPinned)}>
                      {isPinned ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Pin
                        </>
                      )}
                    </DropdownMenuItem>
                    {!set.is_built_in && (
                      <DropdownMenuItem
                        onClick={() => onDeleteSet(set.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FlashcardSetListView;
