import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useRouter } from '@/hooks/useRouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnections } from "./chat/useConnections";
import { UserProfile, UserTier } from "@/hooks/useRequireAuth";
import { ChatMessage, ChatConversation, UserConnection } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { connections } = useConnections();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch conversations for current user
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        // First, get all conversation IDs where the user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (participantError) throw participantError;
        
        if (!participantData || participantData.length === 0) {
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        const conversationIds = participantData.map(p => p.conversation_id);
        
        // Fetch conversation details
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('chat_conversations')
          .select('*')
          .in('id', conversationIds);
          
        if (conversationsError) throw conversationsError;
        
        // For each conversation, fetch participants with their complete data
        const processedConversations: ChatConversation[] = await Promise.all(
          conversationsData.map(async (conversation) => {
            const { data: participantsData, error: participantsError } = await supabase
              .from('conversation_participants')
              .select(`
                id,
                conversation_id,
                user_id,
                created_at,
                last_read_at
              `)
              .eq('conversation_id', conversation.id);
              
            if (participantsError) throw participantsError;
            
            // Fetch profiles separately for each participant
            const participants = await Promise.all(
              (participantsData || []).map(async (participant) => {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', participant.user_id)
                  .single();
                  
                if (profileError) {
                  console.error('Error fetching profile:', profileError);
                  return {
                    ...participant,
                    profile: null
                  };
                }
                
                return {
                  ...participant,
                  profile: profileData
                };
              })
            );
            
            return {
              ...conversation,
              participants: participants
            } as ChatConversation;
          })
        );

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
            sender:profiles(
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
        .from('chat_conversations')
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
        .from('conversation_participants')
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
      
      // Transform profiles to match UserProfile interface
      const typedProfiles: UserProfile[] = data.map(profile => {
        // Parse notification_preferences if it's a string or use default
        const notificationPrefs = profile.notification_preferences ? 
          (typeof profile.notification_preferences === 'string' 
            ? JSON.parse(profile.notification_preferences)
            : profile.notification_preferences) 
          : { email: false, in_app: true, whatsapp: false };

        return {
          id: profile.id,
          username: profile.username || '',
          avatar_url: profile.avatar_url,
          user_tier: profile.user_tier as UserTier,
          do_not_disturb: profile.do_not_disturb || false,
          dnd_start_time: profile.dnd_start_time,
          dnd_end_time: profile.dnd_end_time,
          notification_preferences: {
            email: notificationPrefs.email === true,
            in_app: notificationPrefs.in_app !== false,
            whatsapp: notificationPrefs.whatsapp === true
          },
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || ''
        };
      });
      
      return typedProfiles;
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
          .from('chat_conversations')
          .insert({})
          .select();

        if (convError) throw convError;

        const conversationId = conversationData[0].id;

        // Add participants to conversation
        await Promise.all([
          supabase
            .from('conversation_participants')
            .insert({
              conversation_id: conversationId,
              user_id: user.id
            }),
          supabase
            .from('conversation_participants')
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
