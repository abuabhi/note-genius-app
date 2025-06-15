
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Note } from '@/types/note';
import { fetchNotesFromSupabase } from '@/contexts/notes/noteUtils';
import { toast } from 'sonner';

// Simplified cache without heavy features
const CACHE_KEY = 'notes_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  notes: Note[];
  timestamp: number;
}

export const useOptimizedNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple cache operations
  const loadFromCache = useCallback((): Note[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: CachedData = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          console.log('📦 Loading notes from cache');
          return parsedCache.notes;
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  }, []);

  const saveToCache = useCallback((notesToCache: Note[]) => {
    try {
      const cacheData: CachedData = {
        notes: notesToCache,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }, []);

  // Simplified load function
  const loadNotes = useCallback(async (useCache = true) => {
    if (useCache) {
      const cachedNotes = loadFromCache();
      if (cachedNotes) {
        setNotes(cachedNotes);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching notes from database...');
      const fetchedNotes = await fetchNotesFromSupabase();
      
      setNotes(fetchedNotes);
      saveToCache(fetchedNotes);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, saveToCache]);

  // Initial load
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Refresh function for manual updates
  const refreshNotes = useCallback(() => {
    loadNotes(false);
  }, [loadNotes]);

  return useMemo(() => ({
    notes,
    loading,
    error,
    refreshNotes,
    setNotes
  }), [notes, loading, error, refreshNotes]);
};
