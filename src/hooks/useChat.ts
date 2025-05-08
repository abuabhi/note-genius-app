
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from "@/hooks/useRequireAuth";
import { ChatMessage, ChatConversation, UserConnection } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch conversations for current user
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const { data, error } = await supabase
          .from('chat_conversation_participants')
          .select(`
            conversation_id,
            conversation:conversations!inner(
              id,
              created_at,
              updated_at,
              last_message_at
            ),
            participants:chat_conversation_participants!conversations_id_fkey(
              user_id,
              last_read_at,
              profile:profiles!chat_conversation_participants_user_id_fkey(
                id,
                username,
                avatar_url,
                user_tier
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Process data to match our expected format
        const processedConversations = data.map((item: any) => ({
          ...item.conversation,
          participants: item.participants
        }));

        setConversations(processedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, toast]);

  // Fetch connections for current user
  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      setLoadingConnections(true);
      try {
        // Get connections where user is either sender or receiver
        const { data, error } = await supabase
          .from('user_connections')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) throw error;
        setConnections(data);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchConnections();
  }, [user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            sender:profiles!chat_messages_sender_id_fkey(
              id,
              username,
              avatar_url,
              user_tier
            )
          `)
          .eq('conversation_id', activeConversationId)
          .order('created_at');

        if (error) throw error;
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  const sendMessage = useCallback(async ({ conversationId, message }: { conversationId: string, message: string }) => {
    if (!user || !conversationId || !message.trim()) return;

    try {
      // Insert message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message: message.trim(),
        })
        .select();

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const updateLastRead = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      await supabase
        .from('chat_conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating last read:', error);
    }
  }, [user]);

  const searchUsers = useCallback(async (query: string): Promise<UserProfile[]> => {
    if (!user || query.length < 3) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, [user]);

  const sendConnectionRequest = useCallback(async (receiverId: string) => {
    if (!user) return;

    try {
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('user_connections')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .single();

      if (existingConnection) {
        toast({
          title: 'Connection exists',
          description: 'You already have a connection with this user',
        });
        return;
      }

      // Create new connection request
      const { error } = await supabase
        .from('user_connections')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Request sent',
        description: 'Connection request has been sent',
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const acceptConnectionRequest = useCallback(async (connectionId: string) => {
    if (!user) return;

    try {
      // Update connection status
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Create conversation for these users
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select();

        if (convError) throw convError;

        const conversationId = conversationData[0].id;

        // Add participants to conversation
        await Promise.all([
          supabase
            .from('chat_conversation_participants')
            .insert({
              conversation_id: conversationId,
              user_id: user.id
            }),
          supabase
            .from('chat_conversation_participants')
            .insert({
              conversation_id: conversationId,
              user_id: data[0].sender_id
            })
        ]);

        toast({
          title: 'Connection accepted',
          description: 'You can now chat with this user',
        });
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept connection',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const declineConnectionRequest = useCallback(async (connectionId: string) => {
    if (!user) return;

    try {
      // Update connection status
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'declined' })
        .eq('id', connectionId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      toast({
        title: 'Connection declined',
        description: 'Connection request has been declined',
      });
    } catch (error) {
      console.error('Error declining connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline connection',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const subscribeToMessages = useCallback((conversationId: string, callback: (message: ChatMessage) => void) => {
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        (payload) => {
          // When a new message is received
          const newMessage = payload.new as ChatMessage;
          setMessages(prevMessages => [...prevMessages, newMessage]);
          callback(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    conversations,
    connections,
    messages,
    activeConversationId,
    setActiveConversationId,
    loadingConversations,
    loadingConnections,
    loadingMessages,
    sendMessage,
    updateLastRead,
    searchUsers,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    subscribeToMessages,
  };
};
