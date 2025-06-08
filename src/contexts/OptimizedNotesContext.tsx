
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotesQuery } from '@/hooks/performance/useOptimizedNotesQuery';
import { useEnhancedRetry } from '@/hooks/performance/useEnhancedRetry';
import { useProductionMetrics } from '@/hooks/performance/useProductionMetrics';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimizedNotesContextType {
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refetch: () => void;
  prefetchNextPage: () => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const OptimizedNotesContext = createContext<OptimizedNotesContextType | undefined>(undefined);

export const OptimizedNotesProvider = ({ children }: { children: ReactNode }) => {
  const { recordMetric } = useProductionMetrics('OptimizedNotesProvider');
  const { executeWithRetry } = useEnhancedRetry({
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (error, attempt) => {
      recordMetric('notes_operation_retry', attempt, {
        error: error.message
      });
    }
  });

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use optimized query
  const {
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    refetch,
    prefetchNextPage
  } = useOptimizedNotesQuery({
    search: searchTerm,
    subject: selectedSubject,
    page: currentPage,
    pageSize: 20,
    sortBy: sortType as 'newest' | 'oldest' | 'alphabetical',
    showArchived
  });

  // Optimized operations with retry logic
  const addNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    return executeWithRetry(async () => {
      recordMetric('note_add_start', 1);
      
      // Mock implementation - replace with actual API call
      const newNote: Note = {
        ...noteData,
        id: `note_${Date.now()}`,
      };
      
      recordMetric('note_add_success', 1);
      toast.success('Note created successfully');
      refetch();
      
      return newNote;
    }, 'Add note');
  }, [executeWithRetry, recordMetric, refetch]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>): Promise<void> => {
    return executeWithRetry(async () => {
      recordMetric('note_update_start', 1, { noteId: id });
      
      // Mock implementation - replace with actual API call
      console.log('Updating note:', id, updates);
      
      recordMetric('note_update_success', 1, { noteId: id });
      toast.success('Note updated successfully');
      refetch();
    }, 'Update note');
  }, [executeWithRetry, recordMetric, refetch]);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    return executeWithRetry(async () => {
      recordMetric('note_delete_start', 1, { noteId: id });
      
      // Mock implementation - replace with actual API call
      console.log('Deleting note:', id);
      
      recordMetric('note_delete_success', 1, { noteId: id });
      toast.success('Note deleted successfully');
      refetch();
    }, 'Delete note');
  }, [executeWithRetry, recordMetric, refetch]);

  // Debounced search
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const contextValue = useMemo(() => ({
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: handleSearchChange,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject,
    currentPage,
    setCurrentPage,
    refetch,
    prefetchNextPage,
    addNote,
    updateNote,
    deleteNote
  }), [
    notes, totalCount, hasMore, isLoading, error,
    searchTerm, handleSearchChange, sortType, showArchived,
    selectedSubject, currentPage, refetch, prefetchNextPage,
    addNote, updateNote, deleteNote
  ]);

  return (
    <OptimizedNotesContext.Provider value={contextValue}>
      {children}
    </OptimizedNotesContext.Provider>
  );
};

export const useOptimizedNotes = () => {
  const context = useContext(OptimizedNotesContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotes must be used within an OptimizedNotesProvider');
  }
  return context;
};
