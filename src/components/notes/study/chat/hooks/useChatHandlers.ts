
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { ChatUIMessage } from '../types/noteChat';
import { useNoteChat } from './useNoteChat';
import { useStreamingChat } from './useStreamingChat';
import { useNoteChatHistory } from './useNoteChatHistory';
import { useErrorHandler } from './useErrorHandler';

export const useChatHandlers = (note: Note) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [useStreaming, setUseStreaming] = useState(true);
  
  const { sendMessage, isLoading, error } = useNoteChat(note);
  const { sendStreamingMessage, isStreaming, streamingMessage } = useStreamingChat(note);
  const { messages, addUserMessage, addMessage } = useNoteChatHistory(note.id);
  const { handleError, clearErrors, getLastError, canRetry } = useErrorHandler();

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      clearErrors();
      
      const userMessage = addUserMessage(message);

      if (useStreaming) {
        await sendStreamingMessage(
          message,
          messages,
          (content) => {
            // Handle streaming updates
          },
          (finalMessage) => {
            addMessage(finalMessage);
          }
        );
      } else {
        const aiResponse = await sendMessage(message, messages);
        if (aiResponse) {
          addMessage(aiResponse);
        }
      }
    } catch (error) {
      handleError(error, 'sending message');
    }
  }, [sendMessage, sendStreamingMessage, addUserMessage, addMessage, messages, useStreaming, handleError, clearErrors]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  const handleSelectFollowUp = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  const handleFlashcardCreated = useCallback(() => {
    setSelectedText('');
  }, []);

  const getErrorMessage = () => {
    const lastError = getLastError();
    if (lastError) {
      return lastError.message;
    }
    if (error) {
      return typeof error === 'string' ? error : 'An error occurred';
    }
    return null;
  };

  return {
    messages,
    selectedText,
    isProcessing: isLoading || isStreaming,
    isLoading,
    isStreaming,
    streamingMessage,
    errorMessage: getErrorMessage(),
    canRetry,
    handleSendMessage,
    handleSelectSuggestion,
    handleSelectFollowUp,
    handleFlashcardCreated,
    clearErrors
  };
};
