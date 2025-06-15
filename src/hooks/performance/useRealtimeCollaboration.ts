
import { useState, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';

interface CollaborationUpdate {
  type: 'note_created' | 'note_updated' | 'note_deleted' | 'user_joined' | 'user_left';
  userId: string;
  noteId?: string;
  data: any;
  timestamp: number;
}

interface UserPresence {
  userId: string;
  lastSeen: number;
  activeNote?: string;
}

export const useRealtimeCollaboration = (notes: Note[], setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void) => {
  const [collaborationState, setCollaborationState] = useState({
    activeUsers: [] as UserPresence[],
    recentUpdates: [] as CollaborationUpdate[],
    isConnected: false
  });

  // Broadcast updates to other users
  const broadcastUpdate = useCallback(async (update: CollaborationUpdate) => {
    try {
      console.log('🔄 Broadcasting collaboration update:', update);
      
      // In a real implementation, this would use WebSocket or Supabase realtime
      // For now, we'll just log and update local state
      setCollaborationState(prev => ({
        ...prev,
        recentUpdates: [update, ...prev.recentUpdates.slice(0, 9)]
      }));

      // Simulate real-time update via Supabase channel
      const channel = supabase.channel('notes_collaboration');
      await channel.send({
        type: 'broadcast',
        event: 'collaboration_update',
        payload: update
      });

    } catch (error) {
      console.error('Error broadcasting update:', error);
    }
  }, []);

  // Handle incoming collaboration updates
  const handleCollaborationUpdate = useCallback((update: CollaborationUpdate) => {
    console.log('📨 Received collaboration update:', update);

    switch (update.type) {
      case 'note_created':
        // Add new note if it doesn't exist
        setNotes((prev: Note[]) => {
          const exists = prev.find(n => n.id === update.data.id);
          if (!exists) {
            return [update.data, ...prev];
          }
          return prev;
        });
        break;

      case 'note_updated':
        // Update existing note
        setNotes((prev: Note[]) => prev.map(note => 
          note.id === update.noteId 
            ? { ...note, ...update.data }
            : note
        ));
        break;

      case 'note_deleted':
        // Remove deleted note
        setNotes((prev: Note[]) => prev.filter(note => note.id !== update.noteId));
        break;

      case 'user_joined':
        setCollaborationState(prev => ({
          ...prev,
          activeUsers: [
            ...prev.activeUsers.filter(u => u.userId !== update.userId),
            { userId: update.userId, lastSeen: Date.now() }
          ]
        }));
        break;

      case 'user_left':
        setCollaborationState(prev => ({
          ...prev,
          activeUsers: prev.activeUsers.filter(u => u.userId !== update.userId)
        }));
        break;
    }
  }, [setNotes]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase.channel('notes_collaboration');

    // Subscribe to collaboration updates
    channel
      .on('broadcast', { event: 'collaboration_update' }, (payload) => {
        handleCollaborationUpdate(payload.payload);
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: UserPresence[] = Object.values(presenceState)
          .flat()
          .map((presence: any) => ({
            userId: presence.user_id,
            lastSeen: Date.now(),
            activeNote: presence.activeNote
          }));

        setCollaborationState(prev => ({
          ...prev,
          activeUsers,
          isConnected: true
        }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            user_id: 'current-user', // This would come from auth
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [handleCollaborationUpdate]);

  // Sync notes with database periodically
  const syncWithDatabase = useCallback(async () => {
    try {
      // Get the latest updated_at timestamp from current notes
      const latestUpdate = notes.reduce((latest, note) => {
        const noteDate = new Date(note.date || '').getTime();
        return noteDate > latest ? noteDate : latest;
      }, 0);

      // Fetch only notes updated after our latest
      const { data: updatedNotes, error } = await supabase
        .from('notes')
        .select('*')
        .gt('updated_at', new Date(latestUpdate).toISOString());

      if (error) {
        console.error('Error syncing with database:', error);
        return;
      }

      if (updatedNotes && updatedNotes.length > 0) {
        console.log(`🔄 Syncing ${updatedNotes.length} updated notes from database`);
        
        // Transform and merge updated notes
        const transformedNotes: Note[] = updatedNotes.map(noteData => ({
          id: noteData.id,
          title: noteData.title || "Untitled",
          description: noteData.description || "",
          content: noteData.content || "",
          date: new Date(noteData.created_at).toISOString().split('T')[0],
          subject: noteData.subject || "Uncategorized",
          sourceType: (noteData.source_type as 'manual' | 'scan' | 'import') || 'manual',
          archived: noteData.archived || false,
          pinned: noteData.pinned || false,
          subject_id: noteData.subject_id,
          tags: [],
          summary: noteData.summary,
          summary_status: noteData.summary_status as any,
          summary_generated_at: noteData.summary_generated_at,
          key_points: noteData.key_points,
          key_points_generated_at: noteData.key_points_generated_at,
          markdown_content: noteData.markdown_content,
          markdown_content_generated_at: noteData.markdown_content_generated_at,
          improved_content: noteData.improved_content,
          improved_content_generated_at: noteData.improved_content_generated_at
        }));

        // Merge with existing notes
        setNotes((prev: Note[]) => {
          const merged = [...prev];
          transformedNotes.forEach(updatedNote => {
            const index = merged.findIndex(n => n.id === updatedNote.id);
            if (index >= 0) {
              merged[index] = updatedNote;
            } else {
              merged.unshift(updatedNote);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.error('Error in database sync:', error);
    }
  }, [notes, setNotes]);

  // Set up periodic sync
  useEffect(() => {
    const interval = setInterval(syncWithDatabase, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, [syncWithDatabase]);

  return {
    collaborationState,
    broadcastUpdate,
    syncWithDatabase
  };
};
