
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Note } from '@/types/note';
import { fetchNotesFromSupabase, NotesQueryOptions } from '@/contexts/notes/noteUtils';
import { toast } from 'sonner';

// Optimized cache with pagination support
const CACHE_KEY_PREFIX = 'notes_cache_';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for faster updates

interface CachedData {
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
  timestamp: number;
  queryKey: string;
}

export const useOptimizedNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Query parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortType, setSortType] = useState('newest');

  const pageSize = 20; // Fixed page size for Phase 1

  // Generate cache key based on query parameters
  const getCacheKey = useCallback((options: NotesQueryOptions) => {
    return `${CACHE_KEY_PREFIX}${JSON.stringify(options)}`;
  }, []);

  // Cache operations
  const loadFromCache = useCallback((cacheKey: string) => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache: CachedData = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          console.log('📦 Loading notes from cache');
          return parsedCache;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error);
    }
    return null;
  }, []);

  const saveToCache = useCallback((cacheKey: string, data: Omit<CachedData, 'timestamp' | 'queryKey'>) => {
    try {
      const cacheData: CachedData = {
        ...data,
        timestamp: Date.now(),
        queryKey: cacheKey
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }, []);

  // Load notes with caching and pagination
  const loadNotes = useCallback(async (useCache = true, append = false) => {
    const queryOptions: NotesQueryOptions = {
      page: currentPage,
      pageSize,
      search: searchTerm,
      subject: selectedSubject,
      showArchived,
      sortBy: sortType as any
    };

    const cacheKey = getCacheKey(queryOptions);

    // Try cache first (only for first page)
    if (useCache && currentPage === 1) {
      const cachedData = loadFromCache(cacheKey);
      if (cachedData) {
        setNotes(cachedData.notes);
        setTotalCount(cachedData.totalCount);
        setHasMore(cachedData.hasMore);
        setLoading(false);
        return;
      }
    }

    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🔄 Fetching notes from database...');
      const result = await fetchNotesFromSupabase(queryOptions);
      
      if (append) {
        setNotes(prev => [...prev, ...result.notes]);
      } else {
        setNotes(result.notes);
      }
      
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      
      // Cache first page results
      if (currentPage === 1) {
        saveToCache(cacheKey, {
          notes: result.notes,
          totalCount: result.totalCount,
          hasMore: result.hasMore
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Error loading notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedSubject, showArchived, sortType, getCacheKey, loadFromCache, saveToCache]);

  // Load more notes (pagination)
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  // Reset and reload
  const refreshNotes = useCallback(() => {
    setCurrentPage(1);
    setNotes([]);
    loadNotes(false);
  }, [loadNotes]);

  // Initial load
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Load more when page changes (but not on initial load)
  useEffect(() => {
    if (currentPage > 1) {
      loadNotes(true, true); // append mode
    }
  }, [currentPage]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadNotes(false);
    }
  }, [searchTerm, selectedSubject, showArchived, sortType]);

  return useMemo(() => ({
    notes,
    totalCount,
    hasMore,
    loading,
    error,
    
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    showArchived,
    setShowArchived,
    sortType,
    setSortType,
    
    // Pagination
    currentPage,
    setCurrentPage,
    loadMore,
    
    // Actions
    refreshNotes,
    setNotes
  }), [
    notes, totalCount, hasMore, loading, error,
    searchTerm, selectedSubject, showArchived, sortType,
    currentPage, loadMore, refreshNotes
  ]);
};
