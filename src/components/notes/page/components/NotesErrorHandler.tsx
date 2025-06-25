
import React, { memo } from 'react';
import { ErrorState } from '../ErrorState';
import { useNotesWithPagination } from '@/hooks/notes/useSelectiveNotesContext';

export const NotesErrorHandler = memo(() => {
  const { refreshNotes, error } = useNotesWithPagination();
  
  if (!error) {
    return null;
  }

  return (
    <ErrorState 
      message={`Failed to load notes: ${error || 'Unknown error'}`}
      onRetry={refreshNotes}
    />
  );
});

NotesErrorHandler.displayName = 'NotesErrorHandler';
