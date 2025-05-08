
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useConnections } from './useConnections';
import { useUserSearch } from './useUserSearch';

export const useChat = () => {
  const {
    conversations,
    loadingConversations,
    activeConversationId,
    setActiveConversationId,
    updateLastRead
  } = useConversations();

  const {
    messages,
    loadingMessages,
    sendMessage,
    subscribeToMessages
  } = useMessages(activeConversationId);

  const {
    connections,
    loadingConnections,
    acceptConnectionRequest,
    declineConnectionRequest
  } = useConnections();

  const {
    searchUsers,
    sendConnectionRequest
  } = useUserSearch();

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
  };
};
