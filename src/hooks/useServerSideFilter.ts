import { useCallback, useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

type EntityType = 'notes' | 'flashcard_sets' | 'quizzes';

interface FilterParams {
  search: string;
  subject: string;
  sort: string;
  showArchived?: boolean;
  page?: number;
  pageSize?: number;
}

interface ServerFilterResult {
  data: any[];
  total_count: number;
  has_more: boolean;
  current_page: number;
  page_size: number;
}

// Query key factory for server-side filtering
const getServerFilterQueryKey = (entityType: EntityType, filters: FilterParams) => {
  return [
    'server-filter',
    entityType,
    filters.search.trim(),
    filters.subject.trim(),
    filters.sort.trim(),
    filters.showArchived || false,
    filters.page || 0,
    filters.pageSize || 20
  ];
};

// Server-side filter function caller
const callServerFilter = async (
  entityType: EntityType,
  filters: FilterParams,
  signal?: AbortSignal
): Promise<ServerFilterResult> => {
  console.log('🚀 [SERVER FILTER] Calling server function:', { entityType, filters });

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  let functionName: string;
  switch (entityType) {
    case 'notes':
      functionName = 'filter_user_notes';
      break;
    case 'flashcard_sets':
      functionName = 'filter_user_flashcard_sets';
      break;
    case 'quizzes':
      functionName = 'filter_user_quizzes';
      break;
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }

  const queryParams = {
    p_user_id: user.user.id,
    p_search_term: filters.search || '',
    p_subject_name: filters.subject || 'all',
    p_show_archived: filters.showArchived || false,
    p_sort_by: filters.sort || 'newest',
    p_page_num: filters.page || 0,
    p_page_size: filters.pageSize || 20
  };

  console.log('🔍 [SERVER FILTER] Query params being sent:', queryParams);

  // Use direct SQL call since the functions aren't in generated types yet
  const { data, error } = await supabase
    .rpc(functionName as any, queryParams);

  if (error) {
    console.error('❌ Server filter error:', error);
    throw error;
  }

  console.log('✅ Server filter result:', data);
  console.log('📊 [SERVER FILTER] Result summary:', {
    returnedCount: data?.data?.length || 0,
    totalCount: data?.total_count || 0,
    requestedSubject: filters.subject
  });
  return data as ServerFilterResult;
};

export const useServerSideFilter = (entityType: EntityType) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const queryClient = useQueryClient();

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Create filter params using useMemo to ensure stable reference and proper React Query reactivity
  const filterParams = useMemo((): FilterParams => ({
    search: debouncedSearch,
    subject: selectedSubject,
    sort: sortType,
    showArchived,
    page: currentPage,
    pageSize: 20
  }), [debouncedSearch, selectedSubject, sortType, showArchived, currentPage]);

  // Generate query key using useMemo to ensure it updates when filterParams change
  const queryKey = useMemo(() => {
    const key = getServerFilterQueryKey(entityType, filterParams);
    console.log('🔑 [QUERY KEY] Generated new key:', key);
    return key;
  }, [entityType, filterParams]);

  // Main query using React Query with race condition prevention
  const query = useQuery<ServerFilterResult>({
    queryKey,
    queryFn: ({ signal }) => {
      console.log('🚀 [SERVER FILTER] Starting query with signal:', !!signal);
      return callServerFilter(entityType, filterParams, signal);
    },
    staleTime: 0, // Always fetch fresh data for filters
    gcTime: 0, // No cache retention to prevent stale data
    retry: 1, // Reduce retries to avoid race conditions
    retryDelay: 1000,
  });

  // Reset page when filters change
  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  // Filter change handlers that reset pagination
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSelectedSubject(value);
    setCurrentPage(0);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortType(value);
    setCurrentPage(0);
  }, []);

  const handleShowArchivedChange = useCallback((value: boolean) => {
    setShowArchived(value);
    setCurrentPage(0);
  }, []);

  // Pagination handlers
  const loadMore = useCallback(() => {
    if (query.data?.has_more && !query.isFetching) {
      setCurrentPage(prev => prev + 1);
    }
  }, [query.data?.has_more, query.isFetching]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSortType('newest');
    setShowArchived(false);
    setCurrentPage(0);
  }, []);

  // Computed values
  const hasActiveFilters = !!(searchTerm || (selectedSubject && selectedSubject !== 'all') || showArchived);
  const activeFilterCount = [
    searchTerm,
    selectedSubject !== 'all' ? selectedSubject : null,
    showArchived ? 'archived' : null
  ].filter(Boolean).length;

  // Force refetch function
  const refetch = useCallback(() => {
    return query.refetch();
  }, [query]);

  // Update/delete mutations would go here for specific entity types
  // For now, keeping the interface compatible with useSimpleNotes

  return {
    // Data
    data: query.data?.data || [],
    totalCount: query.data?.total_count || 0,
    hasMore: query.data?.has_more || false,
    currentPage: query.data?.current_page || 0,
    
    // Loading states
    loading: query.isFetching,
    isLoading: query.isLoading,
    isInitialLoading: query.isLoading && !query.data,
    error: query.error?.message || null,
    
    // Filter state
    searchTerm,
    selectedSubject,
    sortType,
    showArchived,
    hasActiveFilters,
    activeFilterCount,
    
    // Filter setters
    setSearchTerm: handleSearchChange,
    setSelectedSubject: handleSubjectChange,
    setSortType: handleSortChange,
    setShowArchived: handleShowArchivedChange,
    
    // Pagination
    loadMore,
    goToPage,
    
    // Actions
    clearFilters,
    refetch,
    
    // For Notes compatibility - these would need to be implemented per entity type
    updateNote: async (id: string, updates: Partial<Note>) => {
      // TODO: Implement server-side update
      console.log('Update not implemented yet');
    },
    deleteNote: async (id: string) => {
      // TODO: Implement server-side delete
      console.log('Delete not implemented yet');
    }
  };
};

// Specific hook for notes (maintains backward compatibility)
export const useServerSideNotes = () => {
  const result = useServerSideFilter('notes');
  return {
    ...result,
    notes: result.data || [], // Alias data as notes for backward compatibility
  };
};
