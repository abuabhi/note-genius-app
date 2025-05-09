
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useConnections } from './useConnections';
import { useUserSearch } from './useUserSearch';
import { useState, useEffect, useCallback } from 'react';

export const useChat = () => {
  const [error, setError] = useState<Error | null>(null);

  const {
    conversations,
    loadingConversations,
    activeConversationId,
    setActiveConversationId,
    updateLastRead,
    resetErrors: resetConversationErrors,
    error: conversationsError
  } = useConversations();

  const {
    messages,
    loadingMessages,
    sendMessage,
    subscribeToMessages,
    error: messagesError
  } = useMessages(activeConversationId);

  const {
    connections,
    loadingConnections,
    acceptConnectionRequest,
    declineConnectionRequest,
    error: connectionsError
  } = useConnections();

  const {
    searchUsers,
    sendConnectionRequest,
    error: userSearchError
  } = useUserSearch();

  // Consolidate errors from all hooks
  useEffect(() => {
    const currentError = conversationsError || messagesError || connectionsError || userSearchError;
    if (currentError) {
      console.error('Chat error:', currentError);
      setError(currentError);
    } else {
      setError(null);
    }
  }, [conversationsError, messagesError, connectionsError, userSearchError]);

  // Reset all errors
  const resetErrors = useCallback(() => {
    resetConversationErrors();
    setError(null);
  }, [resetConversationErrors]);

  return {
    // Conversations
    conversations,
    loadingConversations,
    activeConversationId,
    setActiveConversationId,
    updateLastRead,
    
    // Messages
    messages,
    loadingMessages,
    sendMessage,
    subscribeToMessages,
    
    // Connections
    connections,
    loadingConnections,
    acceptConnectionRequest,
    declineConnectionRequest,
    
    // User search
    searchUsers,
    sendConnectionRequest,
    
    // Error handling
    error,
    resetErrors
  };
};
