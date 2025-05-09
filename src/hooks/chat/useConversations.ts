
import { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { ChatConversation } from "@/types/chat";
import { UseConversationsReturn } from './types';
import { useConversationErrors } from './utils/useConversationErrors';
import { 
  fetchUserConversationIds, 
  fetchConversationsData, 
  fetchConversationParticipants, 
  fetchUserProfiles,
  updateConversationLastRead
} from './utils/conversationFetchers';
import { 
  mapParticipantsWithProfiles,
  assembleConversations 
} from './utils/conversationMappers';

export const useConversations = (): UseConversationsReturn => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const { 
    error, 
    retryCount, 
    handleError, 
    incrementRetry, 
    resetErrors 
  } = useConversationErrors();

  // Fetch participants with profiles for a conversation
  const fetchParticipantsWithProfiles = useCallback(async (conversationId: string) => {
    // Get all participants for this conversation
    const allParticipants = await fetchConversationParticipants(conversationId);
    
    // Get profiles for all participants
    const userIds = allParticipants.map(p => p.user_id);
    const profiles = await fetchUserProfiles(userIds);
    
    // Combine participants with their profiles
    return mapParticipantsWithProfiles(allParticipants, profiles);
  }, []);

  // Fetch conversations for current user
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      resetErrors();
      try {
        console.log("Fetching conversations for user:", user.id);
        
        // First, fetch conversation IDs where the user is a participant
        const participantData = await fetchUserConversationIds(user.id);
        
        if (!participantData.length) {
          console.log("No conversations found for user");
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        // Get the conversation IDs
        const conversationIds = participantData.map(p => p.conversation_id);
        
        // Fetch the conversations
        const conversationsData = await fetchConversationsData(conversationIds);
        
        // Process conversations with participants
        const conversationsWithParticipants = await assembleConversations(
          conversationsData,
          fetchParticipantsWithProfiles
        );
        
        setConversations(conversationsWithParticipants);
        console.log("Successfully loaded conversations:", conversationsWithParticipants.length);
      } catch (error) {
        handleError(error, 'Failed to load conversations');
        incrementRetry();
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, fetchParticipantsWithProfiles, resetErrors, handleError, incrementRetry]);

  const updateLastRead = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      await updateConversationLastRead(conversationId, user.id);
    } catch (error) {
      handleError(error, 'Failed to update last read timestamp');
    }
  }, [user, handleError]);

  return {
    conversations,
    loadingConversations,
    setActiveConversationId,
    activeConversationId,
    updateLastRead,
    resetErrors,
    error,
  };
};
