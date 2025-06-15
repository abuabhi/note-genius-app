
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Grid3X3, List } from "lucide-react";
import { Link } from "react-router-dom";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

interface FlashcardsPageHeaderProps {
  loading: boolean;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
}

export const FlashcardsPageHeader = ({ 
  loading, 
  viewMode, 
  onViewModeChange 
}: FlashcardsPageHeaderProps) => {
  const breadcrumbs = [
    { label: "Flashcards" }
  ];

  const actions = (
    <>
      {/* View Mode Toggle */}
      <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
        <Button
          variant={viewMode === 'card' ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange('card')}
          className={`rounded-r-none ${viewMode === 'card' ? 'bg-mint-500 text-white' : 'text-gray-600'}`}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={`rounded-l-none ${viewMode === 'list' ? 'bg-mint-500 text-white' : 'text-gray-600'}`}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Create Set Button */}
      <Button
        asChild
        className="bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={loading}
      >
        <Link to="/flashcards/create">
          <Plus className="h-4 w-4 mr-2" />
          Create Set
        </Link>
      </Button>
    </>
  );

  return (
    <StandardPageHeader
      title="Flashcards"
      description="Organize and study your flashcard collections"
      icon={<BookOpen className="h-6 w-6 text-white" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
};
