
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { notesQueryKeys } from './useNotesQueries';
import { extractErrorMessage } from '@/utils/errorUtils';

const buildDefinedNoteUpdatePayload = (updates: Partial<Note>) => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const assign = (dbColumn: string, value: unknown) => {
    if (value !== undefined) payload[dbColumn] = value;
  };

  assign('title', updates.title);
  assign('description', updates.description);
  assign('content', updates.content);
  assign('subject', updates.subject);
  assign('subject_id', updates.subject_id);
  assign('archived', updates.archived);
  assign('pinned', updates.pinned);
  assign('summary', updates.summary);
  assign('summary_status', updates.summary_status);
  assign('summary_generated_at', updates.summary_generated_at);
  assign('key_points', updates.key_points);
  assign('key_points_status', updates.key_points_status);
  assign('key_points_generated_at', updates.key_points_generated_at);
  assign('markdown_content', updates.markdown_content);
  assign('markdown_content_status', updates.markdown_content_status);
  assign('markdown_content_generated_at', updates.markdown_content_generated_at);
  assign('questions_content', updates.questions_content);
  assign('questions_status', updates.questions_status);
  assign('questions_generated_at', updates.questions_generated_at);
  assign('enriched_content', updates.enriched_content);
  assign('enriched_status', updates.enriched_status);
  assign('enriched_content_generated_at', updates.enriched_content_generated_at);
  assign('source_type', updates.sourceType);
  assign('video_url', updates.video_url);
  assign('video_metadata', updates.video_metadata);

  return payload;
};

// Create note mutation
export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: Omit<Note, 'id'>): Promise<Note> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.user.id,
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          date: noteData.date,
          subject: noteData.subject,
          subject_id: noteData.subject_id,
          source_type: noteData.sourceType,
          archived: noteData.archived || false,
          pinned: noteData.pinned || false,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform to Note interface
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        content: data.content || '',
        date: data.date,
        subject: data.subject || 'Uncategorized',
        sourceType: (data.source_type || 'manual') as 'manual' | 'import' | 'scan',
        archived: data.archived || false,
        pinned: data.pinned || false,
        subject_id: data.subject_id,
        tags: []
      } as Note;
    },
    onSuccess: (newNote) => {
      console.log('🚀 [CREATE MUTATION] ✅ Note creation successful:', newNote);
      console.log('🚀 [CREATE MUTATION] Updating cache with new note...');
      
      // Enhanced optimistic update - add to ALL relevant queries with detailed logging
      const queries = queryClient.getQueriesData({ queryKey: notesQueryKeys.lists() });
      console.log('🚀 [CREATE MUTATION] Found queries to update:', queries.length);
      
      queryClient.setQueriesData(
        { queryKey: notesQueryKeys.lists() },
        (oldData: any) => {
          console.log('🚀 [CREATE MUTATION] Updating query data:', {
            hasOldData: !!oldData,
            oldNotesCount: oldData?.notes?.length || 0,
            oldTotalCount: oldData?.totalCount || 0
          });
          
          if (!oldData) {
            console.log('🚀 [CREATE MUTATION] No old data - creating new structure');
            return {
              notes: [newNote],
              totalCount: 1,
              hasMore: false
            };
          }
          
          const updatedData = {
            ...oldData,
            notes: [newNote, ...oldData.notes],
            totalCount: oldData.totalCount + 1
          };
          
          console.log('🚀 [CREATE MUTATION] Updated data structure:', {
            newNotesCount: updatedData.notes.length,
            newTotalCount: updatedData.totalCount,
            firstNoteId: updatedData.notes[0]?.id,
            firstNoteTitle: updatedData.notes[0]?.title
          });
          
          return updatedData;
        }
      );
      
      console.log('🚀 [CREATE MUTATION] Cache updated - triggering invalidation...');
      
      // Force invalidation to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
      
      console.log('🚀 [CREATE MUTATION] ✅ All cache operations completed');
      toast.success('Note created successfully');
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  });
};

// Update note mutation
export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(buildDefinedNoteUpdatePayload(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notesQueryKeys.detail(id) });
      
      // Optimistically update the detail query
      queryClient.setQueryData(notesQueryKeys.detail(id), (old: Note | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      // Optimistically update list queries
      queryClient.setQueriesData(
        { queryKey: notesQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData?.notes) return oldData;
          return {
            ...oldData,
            notes: oldData.notes.map((note: Note) =>
              note.id === id ? { ...note, ...updates } : note
            )
          };
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimized-note-study'], exact: false });
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists(), exact: false });
      toast.success('Note updated successfully');
    },
    onError: (error, { id }) => {
      // Revert optimistic updates
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  });
};

// Delete note mutation
export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      console.log("🔥 [DELETE MUTATION] Starting deletion for note:", noteId);
      console.log("🔥 [DELETE MUTATION] Note ID type:", typeof noteId);
      console.log("🔥 [DELETE MUTATION] Note ID length:", noteId?.length);
      
      // Test database connection first
      console.log("🔥 [DELETE MUTATION] Testing database connection...");
      const { data: testData, error: testError } = await supabase.from('notes').select('id').limit(1);
      console.log("🔥 [DELETE MUTATION] Database connection test:", { testData, testError });
      
      // Check if note exists before deletion
      console.log("🔥 [DELETE MUTATION] Checking if note exists...");
      const { data: existingNote, error: checkError } = await supabase
        .from('notes')
        .select('id, title, user_id')
        .eq('id', noteId)
        .single();
      
      console.log("🔥 [DELETE MUTATION] Note existence check:", { existingNote, checkError });
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("❌ [DELETE MUTATION] Error checking note existence:", checkError);
        throw new Error(`Failed to verify note exists: ${checkError.message}`);
      }
      
      if (!existingNote) {
        console.error("❌ [DELETE MUTATION] Note not found:", noteId);
        throw new Error('Note not found');
      }
      
      console.log("🔥 [DELETE MUTATION] Calling force_delete_note_optimized function...");
      console.log("🔥 [DELETE MUTATION] Parameters:", { note_id_param: noteId });
      
      const { data, error } = await supabase
        .rpc('force_delete_note_optimized', { note_id_param: noteId });

      console.log("🔥 [DELETE MUTATION] RPC response:", { data, error });
      console.log("🔥 [DELETE MUTATION] RPC data type:", typeof data);
      console.log("🔥 [DELETE MUTATION] RPC data value:", data);

      if (error) {
        console.error("❌ [DELETE MUTATION] Supabase RPC error:", error);
        console.error("❌ [DELETE MUTATION] Error code:", error.code);
        console.error("❌ [DELETE MUTATION] Error message:", error.message);
        console.error("❌ [DELETE MUTATION] Error details:", error.details);
        console.error("❌ [DELETE MUTATION] Error hint:", error.hint);
        throw error;
      }
      
      if (data === false || data === null || data === undefined) {
        console.error("❌ [DELETE MUTATION] Function returned false/null/undefined:", data);
        throw new Error(`Database function returned ${data} - deletion failed`);
      }
      
      // Verify deletion was successful
      console.log("🔥 [DELETE MUTATION] Verifying deletion...");
      const { data: verifyData, error: verifyError } = await supabase
        .from('notes')
        .select('id')
        .eq('id', noteId)
        .single();
        
      console.log("🔥 [DELETE MUTATION] Verification result:", { verifyData, verifyError });
      
      if (verifyData) {
        console.error("❌ [DELETE MUTATION] Note still exists after deletion!");
        throw new Error('Note still exists after deletion attempt');
      }
      
      console.log("✅ [DELETE MUTATION] Successfully deleted and verified note:", noteId);
      return noteId;
    },
    onMutate: async (noteId) => {
      console.log('🗑️ [DELETE MUTATION] onMutate - Optimistic update starting for:', noteId);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notesQueryKeys.lists() });
      console.log('🗑️ [DELETE MUTATION] onMutate - Cancelled pending queries');
      
      // Get current queries for logging
      const queries = queryClient.getQueriesData({ queryKey: notesQueryKeys.lists() });
      console.log('🗑️ [DELETE MUTATION] onMutate - Found queries to update:', queries.length);
      
      // Optimistically remove from all list queries
      queryClient.setQueriesData(
        { queryKey: notesQueryKeys.lists() },
        (oldData: any) => {
          console.log('🗑️ [DELETE MUTATION] onMutate - Updating query data:', {
            hasOldData: !!oldData,
            oldNotesCount: oldData?.notes?.length || 0,
            oldTotalCount: oldData?.totalCount || 0,
            removingNoteId: noteId
          });
          
          if (!oldData?.notes) {
            console.log('🗑️ [DELETE MUTATION] onMutate - No old data or notes array');
            return oldData;
          }
          
          const updatedData = {
            ...oldData,
            notes: oldData.notes.filter((note: Note) => note.id !== noteId),
            totalCount: Math.max(0, oldData.totalCount - 1)
          };
          
          console.log('🗑️ [DELETE MUTATION] onMutate - Updated data structure:', {
            newNotesCount: updatedData.notes.length,
            newTotalCount: updatedData.totalCount,
            wasNoteRemoved: !updatedData.notes.some((note: Note) => note.id === noteId)
          });
          
          return updatedData;
        }
      );
      
      console.log('🗑️ [DELETE MUTATION] onMutate - ✅ Optimistic update completed');
    },
    onSuccess: (deletedNoteId) => {
      console.log('🗑️ [DELETE MUTATION] ✅ Delete operation successful:', deletedNoteId);
      console.log('🗑️ [DELETE MUTATION] Cache should already be updated via onMutate');
      
      // Additional cache invalidation to ensure consistency
      console.log('🗑️ [DELETE MUTATION] Triggering cache invalidation for safety...');
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
      
      console.log('🗑️ [DELETE MUTATION] ✅ All delete operations completed');
      toast.success('Note deleted successfully');
    },
    onError: (error, noteId) => {
      // Revert optimistic updates
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
      const errorMessage = extractErrorMessage(error);
      console.error('❌ [DELETE MUTATION ERROR] Failed to delete note:', { 
        noteId, 
        error, 
        message: errorMessage.message,
        details: errorMessage.details,
        code: errorMessage.code 
      });
      console.error('❌ [DELETE MUTATION ERROR] Full error object:', error);
      toast.error(`Failed to delete note: ${errorMessage.message}`);
    }
  });
};

// Pin/Unpin note mutation
export const usePinNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ pinned, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { id, pinned };
    },
    onMutate: async ({ id, pinned }) => {
      // Optimistically update
      queryClient.setQueriesData(
        { queryKey: notesQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData?.notes) return oldData;
          return {
            ...oldData,
            notes: oldData.notes.map((note: Note) =>
              note.id === id ? { ...note, pinned } : note
            )
          };
        }
      );
    },
    onSuccess: ({ pinned }) => {
      toast.success(pinned ? 'Note pinned' : 'Note unpinned');
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
      console.error('Failed to pin/unpin note:', error);
      toast.error('Failed to update note pin status');
    }
  });
};
