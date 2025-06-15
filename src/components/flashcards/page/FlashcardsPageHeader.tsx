
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Grid3X3, List } from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-mint-500 to-blue-500 rounded-xl">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-mint-900">Flashcards</h1>
          <p className="text-gray-600">Organize and study your flashcard collections</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
};
