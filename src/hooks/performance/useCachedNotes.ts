
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useCacheStrategy } from './useCacheStrategy';
import { useProductionMetrics } from './useProductionMetrics';
import { Note } from '@/types/note';

interface NotesPage {
  notes: Note[];
  nextPage: number | null;
  totalCount: number;
}

interface NoteDetails extends Note {
  relatedNotes?: Note[];
  subjects?: Array<{ id: string; name: string }>;
}

export const useCachedNotes = () => {
  const { user } = useAuth();
  const { cacheConfigs, staleWhileRevalidate } = useCacheStrategy();
  const { recordMetric } = useProductionMetrics('CachedNotes');

  // Cached notes with infinite pagination
  const {
    data: notesData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['cached-notes', user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<NotesPage> => {
      if (!user) return { notes: [], nextPage: null, totalCount: 0 };

      recordMetric('notes_page_fetch', pageParam, { userId: user.id });

      // Mock optimized data fetching - replace with actual implementation
      const mockNotes: Note[] = Array.from({ length: 20 }, (_, i) => ({
        id: `note-${pageParam}-${i}`,
        title: `Note ${(pageParam as number) * 20 + i + 1}`,
        description: `Description for note ${(pageParam as number) * 20 + i + 1}`,
        content: `Content for note ${(pageParam as number) * 20 + i + 1}`,
        date: new Date().toISOString().split('T')[0],
        category: 'General',
        sourceType: 'manual' as const,
        archived: false,
        pinned: Math.random() > 0.8,
        subject: 'General',
        tags: []
      }));

      return {
        notes: mockNotes,
        nextPage: (pageParam as number) < 10 ? (pageParam as number) + 1 : null,
        totalCount: 200
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
    ...cacheConfigs.user,
    initialPageParam: 0,
  });

  // Cached individual note
  const useCachedNote = (noteId: string) => {
    return useQuery({
      queryKey: ['cached-note', noteId],
      queryFn: async (): Promise<NoteDetails> => {
        recordMetric('single_note_fetch', 1, { noteId });

        return await staleWhileRevalidate(
          ['note-details', noteId],
          async () => ({
            id: noteId,
            title: `Note ${noteId}`,
            description: `Description for note ${noteId}`,
            content: `Detailed content for note ${noteId}`,
            date: new Date().toISOString().split('T')[0],
            category: 'General',
            sourceType: 'manual' as const,
            archived: false,
            pinned: false,
            subject: 'General',
            tags: [],
            relatedNotes: [],
            subjects: [{ id: '1', name: 'General' }]
          })
        ) as NoteDetails;
      },
      enabled: !!noteId,
      ...cacheConfigs.static,
    });
  };

  // Prefetch related notes
  const prefetchRelatedNotes = async (noteId: string) => {
    if (!user) return;

    await staleWhileRevalidate(
      ['related-notes', noteId],
      async () => {
        recordMetric('related_notes_prefetch', 1, { noteId });
        return [];
      }
    );
  };

  return {
    notes: notesData?.pages.flatMap(page => page.notes) || [],
    totalCount: notesData?.pages[0]?.totalCount || 0,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    useCachedNote,
    prefetchRelatedNotes
  };
};
