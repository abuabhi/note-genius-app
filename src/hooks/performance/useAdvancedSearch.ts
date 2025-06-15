
import { useState, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';
import { useBackgroundProcessor } from './useBackgroundProcessor';
import { useMultiLevelCache } from './useMultiLevelCache';

interface SearchIndex {
  [key: string]: Set<string>; // word -> note IDs
}

interface SearchOptions {
  includeContent: boolean;
  includeTags: boolean;
  includeSubject: boolean;
  fuzzyMatch: boolean;
  maxResults: number;
  sortBy: 'relevance' | 'date' | 'title';
}

interface SearchResult {
  note: Note;
  score: number;
  matchedFields: string[];
  highlights: { field: string; text: string }[];
}

export const useAdvancedSearch = (notes: Note[]) => {
  const [searchIndex, setSearchIndex] = useState<SearchIndex>({});
  const [isIndexing, setIsIndexing] = useState(false);
  const [lastIndexUpdate, setLastIndexUpdate] = useState<Date | null>(null);
  const { addJob, registerWorker } = useBackgroundProcessor();
  const cache = useMultiLevelCache();

  // Build search index in background
  const buildSearchIndex = useCallback(async () => {
    console.log('🔍 Building search index for', notes.length, 'notes');
    setIsIndexing(true);
    
    const index: SearchIndex = {};
    
    notes.forEach(note => {
      const words = new Set<string>();
      
      // Index title
      note.title.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) words.add(word.trim());
      });
      
      // Index content
      if (note.content) {
        note.content.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 2) words.add(word.trim().replace(/[^\w]/g, ''));
        });
      }
      
      // Index tags
      note.tags?.forEach(tag => {
        words.add(tag.name.toLowerCase());
      });
      
      // Index subject
      if (note.subject) {
        words.add(note.subject.toLowerCase());
      }
      
      // Add to index
      words.forEach(word => {
        if (!index[word]) index[word] = new Set();
        index[word].add(note.id);
      });
    });
    
    setSearchIndex(index);
    setLastIndexUpdate(new Date());
    setIsIndexing(false);
    
    // Cache the index
    cache.set('search_index', index, {
      levels: ['memory'],
      ttl: 10 * 60 * 1000 // 10 minutes
    });
    
    console.log('✅ Search index built with', Object.keys(index).length, 'terms');
  }, [notes, cache]);

  // Register background worker for indexing
  const registerIndexWorker = useCallback(() => {
    registerWorker('build_search_index', async ({ notes: notesToIndex }) => {
      // This runs in background
      await buildSearchIndex();
    });
  }, [registerWorker, buildSearchIndex]);

  // Perform advanced search
  const search = useCallback(async (
    query: string, 
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    const searchOptions: SearchOptions = {
      includeContent: true,
      includeTags: true,
      includeSubject: true,
      fuzzyMatch: false,
      maxResults: 50,
      sortBy: 'relevance',
      ...options
    };
    
    console.log('🔍 Performing advanced search:', query, searchOptions);
    
    // Check cache first
    const cacheKey = `search_${query}_${JSON.stringify(searchOptions)}`;
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
      console.log('📦 Returning cached search results');
      return cachedResults;
    }
    
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    const results: SearchResult[] = [];
    const noteScores = new Map<string, number>();
    const noteMatches = new Map<string, Set<string>>();
    
    // Find matching notes using the index
    searchTerms.forEach(term => {
      const exactMatches = searchIndex[term] || new Set();
      
      // Add exact matches
      exactMatches.forEach(noteId => {
        noteScores.set(noteId, (noteScores.get(noteId) || 0) + 2);
        if (!noteMatches.has(noteId)) noteMatches.set(noteId, new Set());
        noteMatches.get(noteId)!.add(term);
      });
      
      // Add fuzzy matches if enabled
      if (searchOptions.fuzzyMatch) {
        Object.keys(searchIndex).forEach(indexTerm => {
          if (indexTerm.includes(term) && indexTerm !== term) {
            searchIndex[indexTerm].forEach(noteId => {
              noteScores.set(noteId, (noteScores.get(noteId) || 0) + 1);
              if (!noteMatches.has(noteId)) noteMatches.set(noteId, new Set());
              noteMatches.get(noteId)!.add(indexTerm);
            });
          }
        });
      }
    });
    
    // Build results with scores and highlights
    noteScores.forEach((score, noteId) => {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      
      const matchedFields: string[] = [];
      const highlights: { field: string; text: string }[] = [];
      
      // Check what fields matched
      const matches = noteMatches.get(noteId) || new Set();
      matches.forEach(term => {
        if (note.title.toLowerCase().includes(term)) {
          matchedFields.push('title');
          highlights.push({
            field: 'title',
            text: highlightText(note.title, term)
          });
        }
        if (note.content?.toLowerCase().includes(term)) {
          matchedFields.push('content');
          highlights.push({
            field: 'content',
            text: highlightText(note.content.substring(0, 200), term)
          });
        }
        if (note.tags?.some(tag => tag.name.toLowerCase().includes(term))) {
          matchedFields.push('tags');
        }
        if (note.subject?.toLowerCase().includes(term)) {
          matchedFields.push('subject');
        }
      });
      
      results.push({
        note,
        score,
        matchedFields: [...new Set(matchedFields)],
        highlights
      });
    });
    
    // Sort results
    results.sort((a, b) => {
      switch (searchOptions.sortBy) {
        case 'date':
          return new Date(b.note.updated_at).getTime() - new Date(a.note.updated_at).getTime();
        case 'title':
          return a.note.title.localeCompare(b.note.title);
        default:
          return b.score - a.score;
      }
    });
    
    const finalResults = results.slice(0, searchOptions.maxResults);
    
    // Cache results
    cache.set(cacheKey, finalResults, {
      levels: ['memory'],
      ttl: 5 * 60 * 1000 // 5 minutes
    });
    
    console.log(`✅ Found ${finalResults.length} search results`);
    return finalResults;
  }, [searchIndex, notes, cache]);

  // Helper function to highlight matched text
  const highlightText = (text: string, term: string): string => {
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Auto-rebuild index when notes change
  const updateIndex = useCallback(() => {
    if (notes.length > 0) {
      addJob('build_search_index', { notes }, 'medium');
    }
  }, [notes, addJob]);

  // Initialize
  useState(() => {
    registerIndexWorker();
  });

  return {
    search,
    buildSearchIndex,
    updateIndex,
    isIndexing,
    lastIndexUpdate,
    searchIndex
  };
};
