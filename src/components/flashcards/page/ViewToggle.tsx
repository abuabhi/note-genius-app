
import { Button } from '@/components/ui/button';
import { Grid2x2, LayoutList } from 'lucide-react';

// Use a separate type for flashcard view modes to avoid conflicts
type FlashcardViewMode = 'card' | 'list';

interface ViewToggleProps {
  viewMode: FlashcardViewMode;
  onViewModeChange: (mode: FlashcardViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center border border-mint-200 rounded-lg p-1 bg-white">
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="h-8 px-3"
      >
        <Grid2x2 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="h-8 px-3"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
    </div>
  );
};
