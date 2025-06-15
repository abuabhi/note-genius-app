
import React, { createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes as useOptimizedNotesHook } from '@/hooks/useOptimizedNotes';
import { useNotesOperations } from './notes/useNotesOperations';
import { useFilteredNotes } from './notes/state/useFilteredNotes';
import { usePaginatedNotes } from './notes/state/usePaginatedNotes';
import { useRealtimeCollaboration } from '@/hooks/performance/useRealtimeCollaboration';
import { useAdvancedSearch } from '@/hooks/performance/useAdvancedSearch';
import { useIntelligentPrefetching } from '@/hooks/performance/useIntelligentPrefetching';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { useState } from 'react';

interface OptimizedNotesContextType {
  // Core data
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  totalCount: number;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string | null;
  
  // Additional properties for compatibility
  hasMore: boolean;
  refetch: () => void;
  
  // Search and filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  
  // Operations
  refreshNotes: () => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  
  // Advanced features
  advancedSearch: (query: string, options?: any) => Promise<any[]>;
  trackUserAction: (type: string, noteId?: string, metadata?: any) => void;
  collaborationState: any;
  performanceMetrics: any;
  isRealtimeEnabled: boolean;
  setRealtimeEnabled: (enabled: boolean) => void;
}

const OptimizedNotesContext = createContext<OptimizedNotesContextType | undefined>(undefined);

// Memoized provider component
const OptimizedNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const { notes, loading, error, refreshNotes, setNotes } = useOptimizedNotesHook();
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isRealtimeEnabled, setRealtimeEnabled] = useState(true);
  
  // Get filtered notes
  const filteredNotes = useFilteredNotes(notes, searchTerm, sortType, {}, showArchived) || [];
  
  // Get pagination
  const paginationState = usePaginatedNotes(filteredNotes);
  const { currentPage, setCurrentPage, totalPages, paginatedNotes } = paginationState || {
    currentPage: 1,
    setCurrentPage: () => {},
    totalPages: 1,
    paginatedNotes: []
  };

  // Get operations
  const operations = useNotesOperations(
    notes, 
    setNotes, 
    currentPage, 
    setCurrentPage, 
    paginatedNotes
  );

  // Advanced features
  const { collaborationState, broadcastUpdate } = useRealtimeCollaboration(notes, setNotes);
  const { search: advancedSearch, updateIndex } = useAdvancedSearch(notes);
  const { trackAction } = useIntelligentPrefetching(notes);
  const { 
    metrics: performanceMetrics, 
    startMonitoring, 
    trackRenderTime 
  } = usePerformanceMonitor();

  // Track note updates for real-time collaboration
  const handleNoteUpdate = useCallback(async (noteId: string, updates: Partial<Note>) => {
    const result = await operations.updateNote(noteId, updates);
    
    if (isRealtimeEnabled) {
      await broadcastUpdate({
        type: 'note_updated',
        userId: 'current-user', // This would come from auth
        noteId,
        data: updates,
        timestamp: Date.now()
      });
    }
    
    return result;
  }, [operations.updateNote, isRealtimeEnabled, broadcastUpdate]);

  const handleNoteCreate = useCallback(async (note: Omit<Note, 'id'>) => {
    const result = await operations.addNote(note);
    
    if (result && isRealtimeEnabled) {
      await broadcastUpdate({
        type: 'note_created',
        userId: 'current-user',
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }, [operations.addNote, isRealtimeEnabled, broadcastUpdate]);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await operations.deleteNote(noteId);
    
    if (isRealtimeEnabled) {
      await broadcastUpdate({
        type: 'note_deleted',
        userId: 'current-user',
        noteId,
        data: {},
        timestamp: Date.now()
      });
    }
  }, [operations.deleteNote, isRealtimeEnabled, broadcastUpdate]);

  // Track user actions for intelligent prefetching
  const trackUserAction = useCallback((type: string, noteId?: string, metadata?: any) => {
    trackAction(type as any, noteId, metadata);
  }, [trackAction]);

  // Update search index when notes change
  useEffect(() => {
    if (notes.length > 0) {
      updateIndex();
    }
  }, [notes, updateIndex]);

  // Start performance monitoring
  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  // Track render performance
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      trackRenderTime('OptimizedNotesProvider', startTime);
    };
  }, [trackRenderTime]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    // Core data
    notes,
    filteredNotes,
    paginatedNotes,
    totalCount: notes.length,
    loading,
    isLoading: loading, // Alias for compatibility
    error,
    
    // Additional properties for compatibility
    hasMore: false, // For now, set to false since we're not using infinite scroll
    refetch: refreshNotes,
    
    // Search and filtering
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Operations with real-time support
    refreshNotes,
    addNote: handleNoteCreate,
    updateNote: handleNoteUpdate,
    deleteNote: handleNoteDelete,
    pinNote: operations.pinNote,
    archiveNote: operations.archiveNote,
    
    // Advanced features
    advancedSearch,
    trackUserAction,
    collaborationState,
    performanceMetrics,
    isRealtimeEnabled,
    setRealtimeEnabled
  }), [
    notes, filteredNotes, paginatedNotes, loading, error,
    searchTerm, sortType, showArchived, selectedSubject, currentPage, totalPages,
    refreshNotes, handleNoteCreate, handleNoteUpdate, handleNoteDelete,
    operations.pinNote, operations.archiveNote,
    advancedSearch, trackUserAction, collaborationState, performanceMetrics,
    isRealtimeEnabled
  ]);

  return (
    <OptimizedNotesContext.Provider value={contextValue}>
      {children}
    </OptimizedNotesContext.Provider>
  );
});

OptimizedNotesProviderInner.displayName = 'OptimizedNotesProviderInner';

export const OptimizedNotesProvider = ({ children }: { children: ReactNode }) => {
  return (
    <OptimizedNotesProviderInner>
      {children}
    </OptimizedNotesProviderInner>
  );
};

export const useOptimizedNotes = () => {
  const context = useContext(OptimizedNotesContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotes must be used within an OptimizedNotesProvider');
  }
  return context;
};
