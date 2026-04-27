// Prefetch helpers for the Take Quiz flow. Warming both the JS chunk and the
// quiz details query on hover/focus makes navigation feel instant.
import type { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const chunkPrefetched = new Set<string>();

export const prefetchTakeQuizChunk = () => {
  const key = 'take-quiz';
  if (chunkPrefetched.has(key)) return;
  chunkPrefetched.add(key);
  // Match the lazy import in standardRoutes so Vite reuses the same chunk.
  import('@/pages/TakeQuizPage').catch(() => chunkPrefetched.delete(key));
};

const dataPrefetched = new Set<string>();

export const prefetchQuizDetails = (queryClient: QueryClient, quizId: string) => {
  if (!quizId || dataPrefetched.has(quizId)) return;
  dataPrefetched.add(quizId);
  queryClient
    .prefetchQuery({
      queryKey: ['quiz', quizId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('quizzes')
          .select(`*, questions:quiz_questions(*, options:quiz_options(*))`)
          .eq('id', quizId)
          .single();
        if (error) throw error;
        return data;
      },
      staleTime: 60 * 1000,
    })
    .catch(() => dataPrefetched.delete(quizId));
};
