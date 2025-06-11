
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatUIMessage, NoteChatMessage } from '../types/noteChat';

export const useNoteChatHistory = (noteId: string) => {
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const convertToUIMessages = useCallback((dbMessages: NoteChatMessage[]): ChatUIMessage[] => {
    const uiMessages: ChatUIMessage[] = [];
    
    dbMessages.forEach((dbMsg) => {
      // Add user message
      uiMessages.push({
        id: `${dbMsg.id}-user`,
        type: 'user',
        content: dbMsg.message,
        timestamp: dbMsg.created_at
      });
      
      // Add AI response
      uiMessages.push({
        id: `${dbMsg.id}-ai`,
        type: 'ai',
        content: dbMsg.response,
        timestamp: dbMsg.created_at
      });
    });
    
    return uiMessages;
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('note_chat_messages')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: true })
        .limit(50); // Limit to last 50 conversations

      if (error) {
        console.error('Failed to load chat history:', error);
        return;
      }

      const uiMessages = convertToUIMessages(data || []);
      setMessages(uiMessages);
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, convertToUIMessages]);

  const addMessage = useCallback(async (message: ChatUIMessage) => {
    // Update local state immediately for better UX
    setMessages(prev => [...prev, message]);
    
    // If this is a user message, we'll wait for the AI response before saving to DB
    // This is handled in the chat handlers where both user and AI messages are saved together
  }, []);

  const saveConversation = useCallback(async (userMessage: string, aiResponse: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('note_chat_messages')
        .insert({
          note_id: noteId,
          user_id: user.user.id,
          message: userMessage,
          response: aiResponse
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save chat message:', error);
        return;
      }

      console.log('Chat conversation saved to database');
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }, [noteId]);

  const addUserMessage = useCallback((content: string) => {
    const userMessage: ChatUIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    addMessage(userMessage);
    return userMessage;
  }, [addMessage]);

  useEffect(() => {
    if (noteId) {
      loadHistory();
    }
  }, [noteId, loadHistory]);

  return {
    messages,
    isLoading,
    addMessage,
    addUserMessage,
    saveConversation,
    refreshHistory: loadHistory
  };
};
