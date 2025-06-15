
import { useEffect, useCallback, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

interface CollaborationState {
  activeUsers: string[];
  noteBeingEdited: string | null;
  lastActivity: Date;
  conflictResolution: 'newest' | 'merge' | 'manual';
}

interface RealtimeUpdate {
  type: 'note_updated' | 'note_created' | 'note_deleted' | 'user_presence';
  userId: string;
  noteId?: string;
  data: any;
  timestamp: number;
}

export const useRealtimeCollaboration = (notes: Note[], onNotesUpdate: (notes: Note[]) => void) => {
  const { user } = useAuth();
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    activeUsers: [],
    noteBeingEdited: null,
    lastActivity: new Date(),
    conflictResolution: 'newest'
  });
  
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout>();

  // Track user presence and activity
  const trackUserPresence = useCallback(async () => {
    if (!user || !channelRef.current) return;

    const presenceData = {
      user_id: user.id,
      email: user.email,
      last_seen: new Date().toISOString(),
      status: 'online'
    };

    await channelRef.current.track(presenceData);
  }, [user]);

  // Handle real-time note updates
  const handleRealtimeUpdate = useCallback((update: RealtimeUpdate) => {
    console.log('🔄 Real-time update received:', update);
    
    // Don't process our own updates
    if (update.userId === user?.id) return;

    switch (update.type) {
      case 'note_updated':
        const updatedNotes = notes.map(note => 
          note.id === update.noteId ? { ...note, ...update.data } : note
        );
        onNotesUpdate(updatedNotes);
        toast.info(`Note "${update.data.title}" was updated by another user`);
        break;
        
      case 'note_created':
        onNotesUpdate([update.data, ...notes]);
        toast.info(`New note "${update.data.title}" was created`);
        break;
        
      case 'note_deleted':
        const filteredNotes = notes.filter(note => note.id !== update.noteId);
        onNotesUpdate(filteredNotes);
        toast.info('A note was deleted by another user');
        break;
        
      case 'user_presence':
        setCollaborationState(prev => ({
          ...prev,
          activeUsers: update.data.activeUsers,
          lastActivity: new Date()
        }));
        break;
    }
  }, [notes, onNotesUpdate, user?.id]);

  // Broadcast updates to other users
  const broadcastUpdate = useCallback(async (update: RealtimeUpdate) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'note_update',
      payload: update
    });
  }, [user]);

  // Initialize real-time connection
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notes_collaboration_${user.id}`)
      .on('broadcast', { event: 'note_update' }, ({ payload }) => {
        handleRealtimeUpdate(payload);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeUsers = Object.keys(state).map(key => state[key][0]?.user_id).filter(Boolean);
        setCollaborationState(prev => ({
          ...prev,
          activeUsers
        }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
          await trackUserPresence();
        }
      });

    // Set up heartbeat for presence
    heartbeatRef.current = setInterval(() => {
      trackUserPresence();
    }, 30000); // Every 30 seconds

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user, handleRealtimeUpdate, trackUserPresence]);

  // Conflict resolution utilities
  const resolveConflict = useCallback(async (localNote: Note, remoteNote: Note) => {
    switch (collaborationState.conflictResolution) {
      case 'newest':
        return new Date(remoteNote.updated_at) > new Date(localNote.updated_at) 
          ? remoteNote : localNote;
          
      case 'merge':
        // Simple merge strategy - combine content
        return {
          ...remoteNote,
          content: `${localNote.content}\n\n--- Merged with remote changes ---\n\n${remoteNote.content}`
        };
        
      default:
        // Manual resolution - return both for user choice
        return { local: localNote, remote: remoteNote, requiresManualResolution: true };
    }
  }, [collaborationState.conflictResolution]);

  return {
    collaborationState,
    broadcastUpdate,
    resolveConflict,
    trackUserPresence,
    setConflictResolution: (strategy: 'newest' | 'merge' | 'manual') => {
      setCollaborationState(prev => ({ ...prev, conflictResolution: strategy }));
    }
  };
};
