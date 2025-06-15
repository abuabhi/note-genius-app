
import { useState, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';

interface SearchOptions {
  fuzzy?: boolean;
  fields?: string[];
  limit?: number;
}

interface SearchResult {
  note: Note;
  score: number;
  matches: string[];
}

export const useAdvancedSearch = (notes: Note[]) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);

  // Create search index for better performance
  const searchIndex = useMemo(() => {
    const index = new Map<string, Set<string>>();
    
    notes.forEach(note => {
      const searchableText = [
        note.title,
        note.description,
        note.content || '',
        note.subject,
        ...(note.tags?.map(tag => tag.name) || [])
      ].join(' ').toLowerCase();

      // Split into words and create index
      const words = searchableText.split(/\s+/).filter(word => word.length > 2);
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, new Set());
        }
        index.get(word)!.add(note.id);
      });
    });

    return index;
  }, [notes]);

  // Advanced search function
  const search = useCallback(async (query: string, options: SearchOptions = {}) => {
    if (!query.trim()) return [];

    const {
      fuzzy = false,
      fields = ['title', 'description', 'content', 'subject'],
      limit = 50
    } = options;

    const searchTerms = query.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    notes.forEach(note => {
      let score = 0;
      const matches: string[] = [];

      // Search in specified fields
      fields.forEach(field => {
        const fieldValue = (note[field as keyof Note] as string || '').toLowerCase();
        
        searchTerms.forEach(term => {
          if (fieldValue.includes(term)) {
            // Boost score based on field importance and match type
            let fieldScore = 1;
            if (field === 'title') fieldScore = 3;
            else if (field === 'subject') fieldScore = 2;
            
            // Exact word match gets higher score
            const exactMatch = new RegExp(`\\b${term}\\b`).test(fieldValue);
            score += exactMatch ? fieldScore * 2 : fieldScore;
            
            if (!matches.includes(field)) {
              matches.push(field);
            }
          }
        });
      });

      // Include tags in search
      note.tags?.forEach(tag => {
        if (searchTerms.some(term => tag.name.toLowerCase().includes(term))) {
          score += 1.5;
          matches.push('tags');
        }
      });

      // Date-based scoring (newer notes get slight boost)
      const noteDate = new Date(note.date || '');
      const daysSinceCreation = (Date.now() - noteDate.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, (30 - daysSinceCreation) / 30) * 0.1;

      if (score > 0) {
        results.push({
          note,
          score,
          matches
        });
      }
    });

    // Sort by score and apply limit
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Update search history
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 10);
      return newHistory;
    });

    return sortedResults;
  }, [notes]);

  // Get search suggestions based on content
  const getSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];

    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    // Get suggestions from search index
    Array.from(searchIndex.keys())
      .filter(word => word.startsWith(queryLower))
      .slice(0, 5)
      .forEach(word => suggestions.push(word));

    // Add subject suggestions
    const subjects = [...new Set(notes.map(note => note.subject))];
    subjects
      .filter(subject => subject.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .forEach(subject => suggestions.push(subject));

    return suggestions;
  }, [searchIndex, notes]);

  // Update search index (called when notes change)
  const updateIndex = useCallback(() => {
    setIsIndexing(true);
    // Index is automatically updated via useMemo dependency
    setTimeout(() => setIsIndexing(false), 100);
  }, []);

  // Get popular search terms
  const getPopularSearches = useCallback(() => {
    return searchHistory.slice(0, 5);
  }, [searchHistory]);

  return {
    search,
    getSuggestions,
    updateIndex,
    getPopularSearches,
    searchHistory,
    isIndexing
  };
};
