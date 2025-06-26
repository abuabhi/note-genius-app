
import React, { memo } from 'react';
import { OptimizedNotesFilters } from '../OptimizedNotesFilters';

interface NotesFiltersSectionProps {
  viewMode: any;
  onViewModeChange: any;
  useVirtualization: boolean;
  shouldVirtualize: boolean;
  noteCount: number;
  threshold: number;
  renderTime: number;
  onVirtualizationToggle: () => void;
}

export const NotesFiltersSection = memo(() => {
  return (
    <OptimizedNotesFilters />
  );
});

NotesFiltersSection.displayName = 'NotesFiltersSection';
