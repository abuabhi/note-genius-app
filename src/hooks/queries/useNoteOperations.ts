
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { notesQueryKeys } from './useNotesQueries';

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
      // Optimistic update - add to all relevant queries
      queryClient.setQueriesData(
        { queryKey: notesQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            notes: [newNote, ...oldData.notes],
            totalCount: oldData.totalCount + 1
          };
        }
      );
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
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
        .update({
          title: updates.title,
          description: updates.description,
          content: updates.content,
          subject: updates.subject,
          subject_id: updates.subject_id,
          archived: updates.archived,
          pinned: updates.pinned,
          updated_at: new Date().toISOString(),
        })
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
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return noteId;
    },
    onMutate: async (noteId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notesQueryKeys.lists() });
      
      // Optimistically remove from all list queries
      queryClient.setQueriesData(
        { queryKey: notesQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData?.notes) return oldData;
          return {
            ...oldData,
            notes: oldData.notes.filter((note: Note) => note.id !== noteId),
            totalCount: Math.max(0, oldData.totalCount - 1)
          };
        }
      );
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
    },
    onError: (error, noteId) => {
      // Revert optimistic updates
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.lists() });
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
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
