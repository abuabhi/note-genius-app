
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth'; // Updated import path
import { ChatMessage } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { UseMessagesReturn } from './types';

export const useMessages = (
  activeConversationId: string | null
): UseMessagesReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError(null);
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
        setError(error instanceof Error ? error : new Error('Failed to load messages'));
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId, toast]);

  const sendMessage = useCallback(async ({ conversationId, message }: { conversationId: string, message: string }) => {
    if (!user || !conversationId || !message.trim()) return;

    try {
      setError(null);
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
      setError(error instanceof Error ? error : new Error('Failed to send message'));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const subscribeToMessages = useCallback((conversationId: string, callback: (message: ChatMessage) => void) => {
    setError(null);
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
          try {
            const newMessage = payload.new as ChatMessage;
            setMessages(prevMessages => [...prevMessages, newMessage]);
            callback(newMessage);
          } catch (err) {
            console.error('Error processing new message:', err);
            setError(err instanceof Error ? err : new Error('Failed to process new message'));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setError(new Error('Failed to subscribe to message updates'));
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    loadingMessages,
    sendMessage,
    subscribeToMessages,
    error
  };
};
