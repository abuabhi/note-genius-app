
import { Button } from '@/components/ui/button';
import { Grid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ViewMode } from '@/hooks/useViewPreferences';

interface FlashcardsPageHeaderProps {
  loading: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const FlashcardsPageHeader = ({
  loading,
  viewMode,
  onViewModeChange,
}: FlashcardsPageHeaderProps) => {
  console.log('🎯 FlashcardsPageHeader - Current viewMode:', viewMode);

  const handleViewModeChange = (mode: ViewMode) => {
    console.log('🎯 FlashcardsPageHeader - Changing viewMode from', viewMode, 'to', mode);
    onViewModeChange(mode);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-mint-900 mb-2">Flashcard Sets</h1>
        <p className="text-mint-700">Study with your personalized flashcard collections</p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="flex rounded-lg border border-mint-200 bg-white p-1">
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('card')}
            className={`h-8 px-3 ${
              viewMode === 'card' 
                ? 'bg-mint-500 text-white hover:bg-mint-600' 
                : 'text-mint-600 hover:text-mint-700 hover:bg-mint-50'
            }`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className={`h-8 px-3 ${
              viewMode === 'list' 
                ? 'bg-mint-500 text-white hover:bg-mint-600' 
                : 'text-mint-600 hover:text-mint-700 hover:bg-mint-50'
            }`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          asChild 
          className="bg-mint-500 hover:bg-mint-600"
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
