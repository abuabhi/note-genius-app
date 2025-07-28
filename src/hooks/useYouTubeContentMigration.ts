import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types/note';
import { migrateYouTubeNoteContent } from '@/utils/youtubeContentMigration';

/**
 * Hook to automatically migrate YouTube note content by removing redundant metadata
 */
export const useYouTubeContentMigration = (note: Note | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!note || note.sourceType !== 'youtube' || !note.content) {
      return;
    }

    // Check if content needs migration (contains old format)
    const needsMigration = note.content.includes('# YouTube Video') || 
                          note.content.includes('YouTube URL:') ||
                          note.content.includes('**YouTube URL:**') ||
                          note.content.includes('Video ID:') ||
                          note.content.includes('**Video ID:**') ||
                          note.content.includes('## 📝 Full Transcript');

    if (!needsMigration) {
      return;
    }

    // Perform migration asynchronously
    const migrate = async () => {
      try {
        console.log('🔄 Migrating YouTube note content for note:', note.id);
        await migrateYouTubeNoteContent(note.id, note.content || '');
        
        // Invalidate the note query to refetch updated data
        queryClient.invalidateQueries({
          queryKey: ['optimized-note-study', note.id]
        });
        
        console.log('✅ YouTube note content migration completed');
      } catch (error) {
        console.error('❌ YouTube note content migration failed:', error);
      }
    };

    migrate();
  }, [note?.id, note?.content, note?.sourceType, queryClient]);
};