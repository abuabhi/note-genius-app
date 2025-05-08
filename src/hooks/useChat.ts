
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserConnection, ChatConversation, ChatMessage, ConversationParticipant } from '@/types/chat';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from './useRequireAuth';

export const useChat = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch user connections
  const { data: connections, isLoading: loadingConnections } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as UserConnection[];
    },
    enabled: !!user,
  });

  // Fetch user's conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          participants:conversation_participants(
            *,
            profile:profiles(*)
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      // Use type assertion to make TypeScript happy
      return data as unknown as ChatConversation[];
    },
    enabled: !!user,
  });

  // Fetch messages for active conversation
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(*)
        `)
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Use type assertion to make TypeScript happy
      return data as unknown as ChatMessage[];
    },
    enabled: !!activeConversationId && !!user,
  });

  // Create new conversation
  const createConversation = async (participantIds: string[]): Promise<string> => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Include current user in participants if not already included
      if (!participantIds.includes(user.id)) {
        participantIds.push(user.id);
      }

      // Create conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('chat_conversations')
        .insert({})
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add participants
      const participantsToAdd = participantIds.map(userId => ({
        conversation_id: conversationData.id,
        user_id: userId
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsToAdd);

      if (participantsError) throw participantsError;

      // Invalidate conversations query
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      return conversationData.id;
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  // Send message
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string, message: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  });

  // Update last read
  const updateLastRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last read:', error);
    }
  };

  // Send connection request
  const { mutate: sendConnectionRequest } = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_connections')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Connection request sent');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error) => {
      toast.error('Failed to send connection request');
      console.error('Error sending connection request:', error);
    }
  });

  // Accept connection request
  const { mutate: acceptConnectionRequest } = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Connection accepted');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error) => {
      toast.error('Failed to accept connection');
      console.error('Error accepting connection:', error);
    }
  });

  // Decline connection request
  const { mutate: declineConnectionRequest } = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'declined' })
        .eq('id', connectionId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Connection declined');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error) => {
      toast.error('Failed to decline connection');
      console.error('Error declining connection:', error);
    }
  });

  // Block user
  const { mutate: blockUser } = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'blocked' })
        .eq('id', connectionId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('User blocked');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (error) => {
      toast.error('Failed to block user');
      console.error('Error blocking user:', error);
    }
  });

  // Search users
  const searchUsers = async (query: string): Promise<UserProfile[]> => {
    if (!query || query.length < 3 || !user) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data as UserProfile[];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  // Setup realtime subscription for messages
  const subscribeToMessages = (conversationId: string, onNewMessage: (message: ChatMessage) => void) => {
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the sender profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();
          
          // Create a new message object with sender info
          const message = {
            ...payload.new,
            sender: data
          } as unknown as ChatMessage;
          
          onNewMessage(message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    connections,
    conversations,
    messages,
    loadingConnections,
    loadingConversations,
    loadingMessages,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    sendMessage,
    updateLastRead,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    blockUser,
    searchUsers,
    subscribeToMessages
  };
};
