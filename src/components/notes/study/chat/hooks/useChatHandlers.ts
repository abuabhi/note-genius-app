
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { ChatUIMessage } from '../types/noteChat';
import { useNoteChat } from './useNoteChat';
import { useNoteChatHistory } from './useNoteChatHistory';
import { useErrorHandler } from './useErrorHandler';

export const useChatHandlers = (note: Note) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  
  const { 
    sendMessage: sendChatMessage,
    isLoading,
    error,
    clearError 
  } = useNoteChat(note);

  const { 
    messages: historyMessages, 
    addMessage, 
    refreshHistory 
  } = useNoteChatHistory(note.id);
  
  const { 
    handleError, 
    clearErrors,
    canRetry
  } = useErrorHandler();

  // Initialize messages from history when available
  useState(() => {
    if (historyMessages?.length > 0 && messages.length === 0) {
      setMessages(historyMessages);
    }
  });

  const saveToHistory = useCallback(async (userMessage: string, aiResponse: string) => {
    // Create message objects
    const userMsgObj: ChatUIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    const aiMsgObj: ChatUIMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    // Add to UI state
    addMessage(userMsgObj);
    addMessage(aiMsgObj);
    
    // Add to local state
    setMessages(prevMessages => [...prevMessages, userMsgObj, aiMsgObj]);
    
    return { userMessage: userMsgObj, aiMessage: aiMsgObj };
  }, [addMessage]);

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      clearErrors();
      setIsProcessing(true);
      
      // Add user message to UI immediately
      const userMessage: ChatUIMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Send message and get response
      const response = await sendChatMessage(message);
      setIsProcessing(false);
      
      if (response) {
        // Add AI response to messages
        const aiMessage: ChatUIMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: response.content,
          timestamp: new Date().toISOString(),
          followUpQuestions: response.followUpQuestions,
          suggestions: response.suggestions
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        
        // Save conversation history
        await saveToHistory(message, response.content);
      }
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      setIsProcessing(false);
      handleError(error as Error);
      return null;
    }
  }, [sendChatMessage, saveToHistory, handleError, clearErrors]);

  const handleSelectSuggestion = useCallback(async (suggestion: string) => {
    setSelectedText('');
    await handleSendMessage(suggestion);
  }, [handleSendMessage]);

  const handleSelectFollowUp = useCallback(async (question: string) => {
    await handleSendMessage(question);
  }, [handleSendMessage]);

  const handleFlashcardCreated = useCallback(() => {
    // Handle flashcard creation success if needed
    console.log('Flashcard created successfully');
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setSelectedText('');
    clearErrors();
  }, [clearErrors]);

  return {
    messages,
    selectedText,
    isProcessing,
    isLoading,
    isStreaming,
    streamingMessage,
    errorMessage: error,
    canRetry,
    handleSendMessage,
    handleSelectSuggestion,
    handleSelectFollowUp,
    handleFlashcardCreated,
    handleClearChat,
    clearErrors
  };
};
