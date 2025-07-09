import React, { memo } from 'react';
import { SimplifiedNotesFilters } from './SimplifiedNotesFilters';

// Use simplified implementation
export const NotesFiltersSection = memo(() => {
  console.log('🔄 [NOTES FILTERS SECTION] Rendering - using simplified filters');
  return <SimplifiedNotesFilters />;

});

NotesFiltersSection.displayName = 'NotesFiltersSection';