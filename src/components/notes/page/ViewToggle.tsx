
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid2x2, LayoutList } from 'lucide-react';
import { ViewMode } from '@/hooks/useViewPreferences';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  console.log('🎛️ ViewToggle - Current mode:', viewMode);

  const handleCardView = () => {
    console.log('🃏 ViewToggle - Switching to card view');
    onViewModeChange('card');
  };

  const handleListView = () => {
    console.log('📋 ViewToggle - Switching to list view');
    onViewModeChange('list');
  };

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 border border-mint-100/50 shadow-sm">
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={handleCardView}
        className={`h-9 px-4 transition-all duration-200 ${
          viewMode === 'card' 
            ? 'bg-mint-600 text-white shadow-md' 
            : 'text-gray-600 hover:text-mint-700 hover:bg-mint-50'
        }`}
      >
        <Grid2x2 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={handleListView}
        className={`h-9 px-4 transition-all duration-200 ${
          viewMode === 'list' 
            ? 'bg-mint-600 text-white shadow-md' 
            : 'text-gray-600 hover:text-mint-700 hover:bg-mint-50'
        }`}
      >
        <LayoutList className="h-4 w-4" />
      </Button>
    </div>
  );
};
