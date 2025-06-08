
import React from 'react';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { ViewMode } from '@/hooks/useViewPreferences';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-mint-100/50 shadow-sm">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="h-8 px-3"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="h-8 px-3"
      >
        <div className="h-4 w-4 border border-current rounded-sm" />
      </Button>
    </div>
  );
};
