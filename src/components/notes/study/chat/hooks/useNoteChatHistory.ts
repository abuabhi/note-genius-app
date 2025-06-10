
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

  const addMessage = useCallback((message: ChatUIMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

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
    refreshHistory: loadHistory
  };
};
