
import React, { memo, useState } from 'react';
import { ViewMode } from '@/hooks/useViewPreferences';
import { OptimizedNotesFilters } from '../OptimizedNotesFilters';
import { NotesVirtualizationToggle } from './NotesVirtualizationToggle';

interface NotesFiltersSectionProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // Virtualization debug props
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
  useVirtualization,
  shouldVirtualize,
  noteCount,
  threshold,
  renderTime,
  onVirtualizationToggle
}: NotesFiltersSectionProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      <OptimizedNotesFilters 
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
      
      <NotesVirtualizationToggle
        useVirtualization={useVirtualization}
        shouldVirtualize={shouldVirtualize}
        noteCount={noteCount}
        threshold={threshold}
        renderTime={renderTime}
        onToggle={onVirtualizationToggle}
      />
    </div>
  );
});

NotesFiltersSection.displayName = 'NotesFiltersSection';
