
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useCacheStrategy } from './useCacheStrategy';

interface FlashcardSet {
  id: string;
  title: string;
  cardCount: number;
  lastStudied: string;
  accuracy: number;
}

interface FlashcardSetPage {
  sets: FlashcardSet[];
  nextPage: number | null;
}

interface FlashcardSetDetails {
  id: string;
  title: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    difficulty: string;
  }>;
  progress: number;
  lastStudied: string;
}

export const useCachedFlashcards = () => {
  const { user } = useAuth();
  const { cacheConfigs, staleWhileRevalidate } = useCacheStrategy();

  // Cached flashcard sets with pagination
  const {
    data: flashcardSets,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['cached-flashcard-sets', user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<FlashcardSetPage> => {
      if (!user) return { sets: [], nextPage: null };
      
      console.log(`📚 Fetching flashcard sets page ${pageParam}...`);
      
      // Mock paginated data
      const mockSets: FlashcardSet[] = Array.from({ length: 10 }, (_, i) => ({
        id: `set-${pageParam}-${i}`,
        title: `Flashcard Set ${(pageParam as number) * 10 + i + 1}`,
        cardCount: Math.floor(Math.random() * 50) + 10,
        lastStudied: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        accuracy: Math.floor(Math.random() * 30) + 70,
      }));
      
      return {
        sets: mockSets,
        nextPage: (pageParam as number) < 5 ? (pageParam as number) + 1 : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    ...cacheConfigs.user,
    initialPageParam: 0,
  });

  // Cached individual flashcard set
  const useCachedFlashcardSet = (setId: string) => {
    return useQuery({
      queryKey: ['cached-flashcard-set', setId],
      queryFn: async (): Promise<FlashcardSetDetails> => {
        console.log(`📋 Fetching flashcard set ${setId}...`);
        
        // Use stale-while-revalidate for individual sets
        return await staleWhileRevalidate(
          ['flashcard-set-details', setId],
          async () => ({
            id: setId,
            title: `Flashcard Set ${setId}`,
            cards: Array.from({ length: 20 }, (_, i) => ({
              id: `card-${i}`,
              front: `Question ${i + 1}`,
              back: `Answer ${i + 1}`,
              difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
            })),
            progress: Math.floor(Math.random() * 100),
            lastStudied: new Date().toISOString()
          })
        ) as FlashcardSetDetails;
      },
      enabled: !!setId,
      ...cacheConfigs.static, // Individual sets change less frequently
    });
  };

  // Prefetch next sets
  const prefetchNextSets = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    flashcardSets: flashcardSets?.pages.flatMap(page => page.sets) || [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    prefetchNextSets,
    useCachedFlashcardSet
  };
};
