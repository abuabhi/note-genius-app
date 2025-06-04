
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import FlashcardSetCard from "./FlashcardSetCard";

interface FlashcardSetGridProps {
  sets: FlashcardSet[];
  setProgressData: Record<string, number>;
  deletingSet: string | null;
  onDeleteSet: (setId: string) => void;
  hasInitiallyLoaded: boolean;
  searchQuery: string;
  subjectFilter: string | undefined;
}

const FlashcardSetGrid = ({
  sets,
  setProgressData,
  deletingSet,
  onDeleteSet,
  hasInitiallyLoaded,
  searchQuery,
  subjectFilter,
}: FlashcardSetGridProps) => {
  // Empty State when no sets exist
  if (sets.length === 0 && hasInitiallyLoaded) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl p-8 max-w-md mx-auto">
          <BookOpen className="h-16 w-16 text-mint-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-mint-900 mb-2">
            {searchQuery || subjectFilter ? "No sets found" : "No flashcard sets yet"}
          </h3>
          <p className="text-mint-700 mb-6">
            {searchQuery || subjectFilter 
              ? "Try adjusting your search terms or filters" 
              : "Create your first flashcard set to start studying!"
            }
          </p>
          {!searchQuery && !subjectFilter && (
            <Button asChild>
              <Link to="/flashcards/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Set
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Flashcards Grid
  if (sets.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets.map((set) => {
          const progressPercentage = setProgressData[set.id] || 0;
          const isDeleting = deletingSet === set.id;

          return (
            <FlashcardSetCard
              key={set.id}
              set={set}
              progressPercentage={progressPercentage}
              isDeleting={isDeleting}
              onDelete={onDeleteSet}
            />
          );
        })}
      </div>
    );
  }

  return null;
};

export default FlashcardSetGrid;
