
import React, { memo } from 'react';
import { OptimizedNotesFilters } from '../OptimizedNotesFilters';
import { ViewMode } from '@/hooks/useViewPreferences';

interface NotesFiltersSectionProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  useVirtualization: boolean;
  shouldVirtualize: boolean;
  noteCount: number;
  threshold: number;
  renderTime: number;
  onVirtualizationToggle: () => void;
}

export const NotesFiltersSection = memo(({
  viewMode,
  onViewModeChange,
  // Remove virtualization props - they're not needed in the UI
}: NotesFiltersSectionProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      <OptimizedNotesFilters
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
});

NotesFiltersSection.displayName = 'NotesFiltersSection';
