import React, { createContext, useContext, ReactNode, useMemo, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { deleteNoteFromDatabase, updateNoteInDatabase, addNoteToDatabase } from '@/contexts/notes/operations/noteDbOperations';

// Production-ready query keys with consistent cache management
const NOTES_QUERY_KEY = ['notes'] as const;
const notesQueryKeys = {
  all: () => NOTES_QUERY_KEY,
  lists: () => [...NOTES_QUERY_KEY, 'list'] as const,
  list: (filters: any) => [...NOTES_QUERY_KEY, 'list', filters] as const,
  details: () => [...NOTES_QUERY_KEY, 'detail'] as const,
  detail: (id: string) => [...NOTES_QUERY_KEY, 'detail', id] as const,
};

interface ProductionNotesContextType {
  // Core data
  notes: Note[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  
  // CRUD operations with optimistic updates
  addNote: (noteData: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  
  // Operation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Search and filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  sortType: string;
  setSortType: (sort: string) => void;
  
  // Performance utilities
  prefetchNote: (id: string) => void;
  invalidateNotes: () => void;
}

const ProductionNotesContext = createContext<ProductionNotesContextType | undefined>(undefined);

// Optimized notes fetcher with proper error handling
const fetchNotes = async (): Promise<{ notes: Note[]; totalCount: number }> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  console.log('🔄 Fetching notes with optimized query...');
  
  const { data, error, count } = await supabase
    .from('notes')
    .select(`
      id, title, description, content, date, subject, source_type,
      archived, pinned, summary, key_points, markdown_content,
      improved_content, enriched_content, subject_id, created_at, updated_at
    `, { count: 'exact' })
    .eq('user_id', user.user.id)
    .eq('archived', false)
    .order('updated_at', { ascending: false })
    .limit(50); // Reasonable limit for performance

  if (error) {
    console.error('❌ Failed to fetch notes:', error);
    throw error;
  }

  console.log('✅ Notes fetched successfully:', data?.length || 0);

  const notes: Note[] = (data || []).map(note => ({
    id: note.id,
    title: note.title,
    description: note.description || '',
    content: note.content || '',
    date: note.date,
    subject: note.subject || 'Uncategorized',
    sourceType: (note.source_type || 'manual') as 'manual' | 'import' | 'scan',
    archived: note.archived || false,
    pinned: note.pinned || false,
    subject_id: note.subject_id,
    tags: [], // Will be loaded separately if needed
    summary: note.summary,
    key_points: note.key_points,
    markdown_content: note.markdown_content,
    improved_content: note.improved_content,
    enriched_content: note.enriched_content,
  }));

  return { notes, totalCount: count || 0 };
};

const ProductionNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  
  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortType, setSortType] = useState('newest');

  // Main notes query with optimized caching
  const {
    data: notesData = { notes: [], totalCount: 0 },
    isLoading: loading,
    error,
    refetch: refreshNotes,
  } = useQuery({
    queryKey: notesQueryKeys.lists(),
    queryFn: fetchNotes,
    staleTime: 30 * 1000, // 30 seconds - balance between freshness and performance
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create note mutation with optimistic updates
  const createNoteMutation = useMutation({
    mutationFn: addNoteToDatabase,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: notesQueryKeys.lists() });
      
      const previousNotes = queryClient.getQueryData(notesQueryKeys.lists());
      
      // Optimistically add the note
      const optimisticNote: Note = {
        id: 'temp-' + Date.now(),
        ...newNote,
        tags: newNote.tags || [],
      };
      
      queryClient.setQueryData(notesQueryKeys.lists(), (old: any) => ({
        notes: [optimisticNote, ...(old?.notes || [])],
        totalCount: (old?.totalCount || 0) + 1,
      }));
      
      return { previousNotes, optimisticNote };
    },
    onSuccess: (newNote, _, context) => {
      if (newNote && context) {
        // Replace optimistic note with real one
        queryClient.setQueryData(notesQueryKeys.lists(), (old: any) => ({
          notes: old?.notes?.map((note: Note) => 
            note.id === context.optimisticNote.id ? newNote : note
          ) || [newNote],
          totalCount: old?.totalCount || 1,
        }));
        toast.success('Note created successfully');
      }
    },
    onError: (error, _, context) => {
      // Revert optimistic update
      if (context?.previousNotes) {
        queryClient.setQueryData(notesQueryKeys.lists(), context.previousNotes);
      }
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    },
  });

  // Update note mutation with optimistic updates
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Note> }) =>
      updateNoteInDatabase(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: notesQueryKeys.lists() });
      
      const previousNotes = queryClient.getQueryData(notesQueryKeys.lists());
      
      // Optimistically update the note
      queryClient.setQueryData(notesQueryKeys.lists(), (old: any) => ({
        ...old,
        notes: old?.notes?.map((note: Note) =>
          note.id === id ? { ...note, ...updates } : note
        ) || [],
      }));
      
      return { previousNotes };
    },
    onSuccess: () => {
      toast.success('Note updated successfully');
    },
    onError: (error, _, context) => {
      // Revert optimistic update
      if (context?.previousNotes) {
        queryClient.setQueryData(notesQueryKeys.lists(), context.previousNotes);
      }
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    },
  });

  // Delete note mutation with optimistic updates
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNoteFromDatabase,
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: notesQueryKeys.lists() });
      
      const previousNotes = queryClient.getQueryData(notesQueryKeys.lists());
      
      // Optimistically remove the note
      queryClient.setQueryData(notesQueryKeys.lists(), (old: any) => ({
        notes: old?.notes?.filter((note: Note) => note.id !== noteId) || [],
        totalCount: Math.max(0, (old?.totalCount || 1) - 1),
      }));
      
      return { previousNotes };
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
    },
    onError: (error, noteId, context) => {
      // Revert optimistic update
      if (context?.previousNotes) {
        queryClient.setQueryData(notesQueryKeys.lists(), context.previousNotes);
      }
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    },
  });

  // Memoized CRUD operations
  const operations = useMemo(() => ({
    addNote: async (noteData: Omit<Note, 'id'>) => {
      return createNoteMutation.mutateAsync(noteData);
    },
    updateNote: async (id: string, updates: Partial<Note>) => {
      return updateNoteMutation.mutateAsync({ id, updates });
    },
    deleteNote: async (id: string) => {
      return deleteNoteMutation.mutateAsync(id);
    },
    refreshNotes: async () => {
      await refreshNotes();
    },
  }), [createNoteMutation.mutateAsync, updateNoteMutation.mutateAsync, deleteNoteMutation.mutateAsync, refreshNotes]);

  // Performance utilities
  const prefetchNote = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: notesQueryKeys.detail(id),
      queryFn: () => fetchNotes(), // In real app, fetch single note
      staleTime: 30 * 1000,
    });
  }, [queryClient]);

  const invalidateNotes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notesQueryKeys.all() });
  }, [queryClient]);

  // Filter and sort notes based on current filters
  const filteredNotes = useMemo(() => {
    let filtered = notesData.notes;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(searchLower) ||
        note.content?.toLowerCase().includes(searchLower)
      );
    }

    // Apply subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    // Apply sorting
    switch (sortType) {
      case 'oldest':
        return [...filtered].sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
      case 'alphabetical':
        return [...filtered].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'newest':
      default:
        return [...filtered].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }
  }, [notesData.notes, searchTerm, selectedSubject, sortType]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    // Core data
    notes: filteredNotes,
    loading,
    error: error?.message || null,
    totalCount: notesData.totalCount,
    
    // CRUD operations
    ...operations,
    
    // Operation states
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    
    // Search and filtering
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    sortType,
    setSortType,
    
    // Performance utilities
    prefetchNote,
    invalidateNotes,
  }), [
    filteredNotes,
    notesData.totalCount,
    loading,
    error,
    operations,
    createNoteMutation.isPending,
    updateNoteMutation.isPending,
    deleteNoteMutation.isPending,
    searchTerm,
    selectedSubject,
    sortType,
    prefetchNote,
    invalidateNotes,
  ]);

  return (
    <ProductionNotesContext.Provider value={contextValue}>
      {children}
    </ProductionNotesContext.Provider>
  );
});

ProductionNotesProviderInner.displayName = 'ProductionNotesProviderInner';

export const ProductionNotesProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ProductionNotesProviderInner>
      {children}
    </ProductionNotesProviderInner>
  );
};

export const useProductionNotes = () => {
  const context = useContext(ProductionNotesContext);
  if (context === undefined) {
    throw new Error('useProductionNotes must be used within a ProductionNotesProvider');
  }
  return context;
};