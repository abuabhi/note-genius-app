
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { ChatUIMessage } from '../types/noteChat';
import { useNoteChat } from './useNoteChat';
import { useNoteChatHistory } from './useNoteChatHistory';
import { useErrorHandler } from './useErrorHandler';

export const useChatHandlers = (note: Note) => {
  const [selectedText, setSelectedText] = useState<string>('');
  
  const { 
    messages, 
    setMessages,
    isProcessing, 
    isLoading, 
    isStreaming, 
    streamingMessage, 
    sendMessage 
  } = useNoteChat(note);

  const { saveToHistory } = useNoteChatHistory(note.id);
  
  const { 
    errorMessage, 
    canRetry, 
    handleError, 
    clearErrors 
  } = useErrorHandler();

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      clearErrors();
      const response = await sendMessage(message);
      if (response) {
        await saveToHistory(message, response.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      handleError(error as Error);
    }
  }, [sendMessage, saveToHistory, handleError, clearErrors]);

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
  }, [setMessages, clearErrors]);

  return {
    messages,
    selectedText,
    isProcessing,
    isLoading,
    isStreaming,
    streamingMessage,
    errorMessage,
    canRetry,
    handleSendMessage,
    handleSelectSuggestion,
    handleSelectFollowUp,
    handleFlashcardCreated,
    handleClearChat,
    clearErrors
  };
};
