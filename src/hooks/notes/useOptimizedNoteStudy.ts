
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';

interface OptimizedNoteStudyResult {
  note: Note | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useOptimizedNoteStudy = (noteId: string): OptimizedNoteStudyResult => {
  const { user } = useAuth();

  const { data: note, isLoading, error, refetch } = useQuery({
    queryKey: ['optimized-note-study', noteId, user?.id],
    queryFn: async (): Promise<Note | null> => {
      if (!user || !noteId) return null;

      console.log('🚀 Optimized note study fetch:', noteId);
      const startTime = performance.now();

      try {
        // Single optimized query with all needed data
        const { data, error } = await supabase
          .from('notes')
          .select(`
            *,
            user_subjects!notes_subject_id_fkey (
              id,
              name
            ),
            note_tags (
              tags (
                id,
                name,
                color
              )
            )
          `)
          .eq('id', noteId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('❌ Optimized note fetch error:', error);
          throw error;
        }

        if (!data) return null;

        // Transform to Note interface with all enhancement fields
        const transformedNote: Note = {
          id: data.id,
          title: data.title || 'Untitled',
          description: data.description || '',
          content: data.content || data.description || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          subject: data.user_subjects?.name || data.subject || 'Uncategorized',
          sourceType: (data.source_type as 'manual' | 'scan' | 'import' | 'youtube') || 'manual',
          archived: data.archived || false,
          pinned: data.pinned || false,
          subject_id: data.subject_id,
          tags: data.note_tags?.map(nt => nt.tags).filter(Boolean) || [],
          
          // YouTube-specific fields
          video_url: data.video_url,
          video_metadata: data.video_metadata as Note['video_metadata'],
          
          // All enhancement fields with proper status handling
          summary: data.summary,
          summary_status: (data.summary_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
          summary_generated_at: data.summary_generated_at,
          
          key_points: data.key_points,
          key_points_status: (data.key_points_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
          key_points_generated_at: data.key_points_generated_at,
          
          markdown_content: data.markdown_content,
          markdown_content_status: (data.markdown_content_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
          markdown_content_generated_at: data.markdown_content_generated_at,
          
          questions_content: data.questions_content,
          questions_status: (data.questions_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
          questions_generated_at: data.questions_generated_at,
          
          enriched_content: data.enriched_content,
          enriched_status: (data.enriched_status as 'pending' | 'generating' | 'completed' | 'failed') || 'completed',
          enriched_content_generated_at: data.enriched_content_generated_at,
          
          // Provide default enhancement_type since it doesn't exist in database
          enhancement_type: 'other' as 'spelling-grammar' | 'clarity' | 'other'
        };

        const duration = performance.now() - startTime;
        console.log(`✅ Optimized note study fetch completed in ${duration.toFixed(2)}ms`);
        
        return transformedNote;

      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ Optimized note study fetch failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    },
    enabled: !!user && !!noteId,
    // Use default cache config instead of specific 'note' config
    staleTime: 60 * 1000, // 1 minute - good for study sessions
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000)
  });

  return {
    note: note || null,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
