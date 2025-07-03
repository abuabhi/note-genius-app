
import { Note } from '@/types/note';
import { useOptimizedRealtimeSync } from '@/hooks/performance/useOptimizedRealtimeSync';

export const useRealtimeNoteSync = (initialNote: Note) => {
  // Use optimized version for better production performance
  return useOptimizedRealtimeSync(initialNote);
};
