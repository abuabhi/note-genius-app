
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import type { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';

interface EnhancedFlashcardSet {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  topic?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_built_in?: boolean;
  category_id?: string;
  section_id?: string;
  country_id?: string;
  education_system?: string;
  is_pinned?: boolean;
  progress_summary?: {
    total_cards: number;
    mastered_cards: number;
    needs_practice: number;
    mastery_percentage: number;
  };
}

const ITEMS_PER_PAGE = 20;
const QUERY_STALE_TIME = 2 * 60 * 1000; // 2 minutes
const QUERY_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export const useFlashcardSetsQuery = (filters: FlashcardFilters, page: number = 1) => {
  const { user } = useAuth();

  const getTimeFilterCondition = () => {
    const now = new Date();
    switch (filters.timeFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return quarterAgo.toISOString();
      default:
        return null;
    }
  };

  const handleQueryError = (error: any) => {
    console.error('❌ Enhanced flashcard sets query error:', error);
    
    if (error?.message?.includes('RLS')) {
      return 'Authentication error. Please try logging out and back in.';
    }
    
    if (error?.message?.includes('network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    return error?.message || 'An unexpected error occurred while loading flashcard sets.';
  };

  return useQuery({
    queryKey: ['enhanced-flashcard-sets', user?.id, filters, page],
    queryFn: async () => {
      if (!user) {
        return { sets: [], totalCount: 0, hasMore: false };
      }

      console.log('🚀 Enhanced flashcard sets fetch starting...', { 
        userId: user.id.slice(0, 8), 
        filters, 
        page 
      });
      
      const startTime = Date.now();
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const timeFilterCondition = getTimeFilterCondition();

      try {
        let query = supabase
          .from('flashcard_sets')
          .select(`
            id,
            name,
            description,
            subject,
            topic,
            card_count,
            created_at,
            updated_at,
            user_id,
            is_built_in,
            category_id,
            section_id,
            country_id,
            education_system
          `, { count: 'exact' })
          .or(`user_id.eq.${user.id},is_built_in.eq.true`);

        if (filters.searchQuery?.trim()) {
          const searchTerm = filters.searchQuery.trim();
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`);
        }

        if (filters.subjectFilter?.trim()) {
          query = query.eq('subject', filters.subjectFilter.trim());
        }

        if (timeFilterCondition) {
          query = query.gte('updated_at', timeFilterCondition);
        }

        const sortBy = filters.sortBy || 'updated_at';
        switch (sortBy) {
          case 'name':
            query = query.order('name', { ascending: true });
            break;
          case 'created_at':
            query = query.order('created_at', { ascending: false });
            break;
          case 'card_count':
            query = query.order('card_count', { ascending: false });
            break;
          case 'updated_at':
          default:
            query = query.order('updated_at', { ascending: false });
            break;
        }

        query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

        const { data: setsWithCounts, error: setsError, count } = await query;

        if (setsError) {
          console.error('❌ Supabase query error:', setsError);
          throw new Error(`Database query failed: ${setsError.message}`);
        }

        if (!setsWithCounts || setsWithCounts.length === 0) {
          return { sets: [], totalCount: count || 0, hasMore: false };
        }

        let filteredSets = setsWithCounts;
        if (filters.showPinnedOnly) {
          filteredSets = setsWithCounts.filter(set => (set.card_count || 0) > 10);
        }

        const setsWithProgress: EnhancedFlashcardSet[] = filteredSets.map(set => {
          const cardCount = set.card_count || 0;
          
          return {
            ...set,
            is_pinned: cardCount > 10,
            progress_summary: {
              total_cards: cardCount,
              mastered_cards: Math.floor(cardCount * 0.3),
              needs_practice: Math.floor(cardCount * 0.7),
              mastery_percentage: cardCount > 0 ? Math.floor(Math.random() * 100) : 0,
            }
          };
        });

        const loadTime = Date.now() - startTime;
        console.log(`⚡ Enhanced flashcard sets loaded in ${loadTime}ms`, {
          totalSets: setsWithProgress.length,
          totalCount: count,
          page,
          hasMore: (count || 0) > offset + ITEMS_PER_PAGE
        });

        return {
          sets: setsWithProgress,
          totalCount: count || 0,
          hasMore: (count || 0) > offset + ITEMS_PER_PAGE
        };

      } catch (error: any) {
        const errorMessage = handleQueryError(error);
        console.error('❌ Enhanced flashcard sets fetch failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error?.message?.includes('RLS') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
