import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Sparkles, ArrowRight } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import FlashcardSetCard from "./FlashcardSetCard";
import { FixedSizeGrid as Grid } from 'react-window';

interface FlashcardSetGridProps {
  sets: FlashcardSet[];
  setProgressData: Record<string, number>;
  deletingSet: string | null;
  onDeleteSet: (setId: string) => void;
  hasInitiallyLoaded: boolean;
  searchQuery: string;
  subjectFilter: string | undefined;
  detailedProgressData?: Record<string, {
    masteredCards: number;
    needsPracticeCards: number;
    totalCards: number;
    masteredPercentage: number;
  }>;
}

const VIRTUALIZATION_THRESHOLD = 20;
const CARD_HEIGHT = 240;
const CARD_GAP = 24;

const FlashcardSetGrid = ({
  sets,
  setProgressData,
  deletingSet,
  onDeleteSet,
  hasInitiallyLoaded,
  searchQuery,
  subjectFilter,
  detailedProgressData = {},
}: FlashcardSetGridProps) => {
  const shouldVirtualize = sets.length > VIRTUALIZATION_THRESHOLD;

  // Empty State when no sets exist
  if (sets.length === 0 && hasInitiallyLoaded) {
    // If user is searching/filtering and found nothing
    if (searchQuery || subjectFilter) {
      return (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-xl p-8 max-w-md mx-auto">
            <BookOpen className="h-16 w-16 text-mint-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-mint-900 mb-2">No sets found</h3>
            <p className="text-mint-700 mb-6">
              Try adjusting your search terms or filters
            </p>
          </div>
        </div>
      );
    }

    // Main empty state - beautiful and encouraging
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-gradient-to-br from-mint-50 via-blue-50 to-mint-100 rounded-3xl p-12 max-w-2xl mx-auto shadow-lg border border-mint-100">
          {/* Icon with sparkles effect */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-mint-500 to-blue-500 rounded-3xl shadow-xl">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-pulse" />
          </div>

          {/* Main message */}
          <h3 className="text-3xl font-bold text-mint-900 mb-4">
            Ready to start learning? 
          </h3>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            You haven't created any flashcard sets yet. Create your first set to begin building 
            your personalized study collection and master any subject!
          </p>

          {/* Step guidance */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/40">
            <div className="flex items-center justify-center gap-3 text-mint-700 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-mint-500 text-white rounded-full text-sm font-bold">
                1
              </div>
              <span className="font-semibold">Create your first flashcard set</span>
            </div>
            <p className="text-sm text-gray-600">
              Choose a subject, add some cards, and start studying smarter
            </p>
          </div>

          {/* Call to action */}
          <div className="space-y-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg">
              <Link to="/flashcards/create" className="inline-flex items-center gap-3">
                <Plus className="h-5 w-5" />
                Create Your First Set
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <p className="text-sm text-gray-500">
              It takes less than a minute to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Virtualized Grid for large lists
  if (sets.length > 0 && shouldVirtualize) {
    const columnCount = 3;
    const rowCount = Math.ceil(sets.length / columnCount);

    const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= sets.length) return null;
      
      const set = sets[index];
      const progressPercentage = setProgressData[set.id] || 0;
      const isDeleting = deletingSet === set.id;
      const detailedProgress = detailedProgressData[set.id];

      return (
        <div style={{ ...style, padding: CARD_GAP / 2 }}>
          <FlashcardSetCard
            set={set}
            progressPercentage={detailedProgress?.masteredPercentage || progressPercentage}
            isDeleting={isDeleting}
            onDelete={onDeleteSet}
            masteredCards={detailedProgress?.masteredCards || 0}
            needsPracticeCards={detailedProgress?.needsPracticeCards || 0}
            totalCards={detailedProgress?.totalCards || set.card_count || 0}
          />
        </div>
      );
    };

    return (
      <div className="relative">
        <div className="text-xs text-gray-400 mb-2">
          Showing {sets.length} flashcard sets (virtualized for performance)
        </div>
        <Grid
          columnCount={columnCount}
          columnWidth={380}
          height={600}
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT + CARD_GAP}
          width={1200}
          className="scrollbar-thin"
        >
          {Cell}
        </Grid>
      </div>
    );
  }

  // Standard Flashcards Grid for smaller lists
  if (sets.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets.map((set) => {
          const progressPercentage = setProgressData[set.id] || 0;
          const isDeleting = deletingSet === set.id;
          const detailedProgress = detailedProgressData[set.id];

          return (
            <FlashcardSetCard
              key={set.id}
              set={set}
              progressPercentage={detailedProgress?.masteredPercentage || progressPercentage}
              isDeleting={isDeleting}
              onDelete={onDeleteSet}
              masteredCards={detailedProgress?.masteredCards || 0}
              needsPracticeCards={detailedProgress?.needsPracticeCards || 0}
              totalCards={detailedProgress?.totalCards || set.card_count || 0}
            />
          );
        })}
      </div>
    );
  }

  return null;
};

export default FlashcardSetGrid;
