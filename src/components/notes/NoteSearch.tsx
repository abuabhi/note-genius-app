
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

// Simple cache for search results
const searchCache = new Map<string, { timestamp: number; results: any }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

export const NoteSearch = () => {
  const { searchTerm, setSearchTerm } = useOptimizedNotes();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('notes-search-history') || '[]');
    } catch {
      return [];
    }
  });

  // Debounced search with cache checking
  const debouncedSearch = useMemo(() => {
    let timeout: NodeJS.Timeout;
    
    return (term: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Check cache first
        const cached = searchCache.get(term);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('🎯 Using cached search result for:', term);
          return;
        }
        
        // Perform search and cache result
        setSearchTerm(term);
        searchCache.set(term, { timestamp: Date.now(), results: null });
        
        // Update search history
        if (term.trim() && !searchHistory.includes(term.trim())) {
          const newHistory = [term.trim(), ...searchHistory].slice(0, 5);
          setSearchHistory(newHistory);
          localStorage.setItem('notes-search-history', JSON.stringify(newHistory));
        }
      }, 300); // 300ms debounce
    };
  }, [setSearchTerm, searchHistory]);

  // Sync with external search term changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Memoized search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Memoized clear search handler
  const clearSearch = useCallback(() => {
    setLocalSearchTerm('');
    setSearchTerm('');
    searchCache.clear(); // Clear cache when clearing search
  }, [setSearchTerm]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mint-400" />
      <Input
        type="text"
        value={localSearchTerm}
        onChange={handleSearchChange}
        placeholder="Search notes..."
        className="pl-10 pr-10 border-mint-200 focus-visible:ring-mint-400"
      />
      {localSearchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
