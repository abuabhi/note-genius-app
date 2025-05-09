
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatConversation } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { UseConversationsReturn } from './types';

export const useConversations = (): UseConversationsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch conversations for current user
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      setError(null);
      try {
        console.log("Fetching conversations for user:", user.id);
        
        // With our new security definer function and policies, we can simplify our queries
        // First, fetch conversation IDs where the user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', user.id);
          
        if (participantError) {
          console.error("Error fetching participants:", participantError);
          throw participantError;
        }
        
        if (!participantData || participantData.length === 0) {
          console.log("No conversations found for user");
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        // Get the conversation IDs
        const conversationIds = participantData.map(p => p.conversation_id);
        
        // Fetch the conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('chat_conversations')
          .select('*')
          .in('id', conversationIds)
          .order('last_message_at', { ascending: false });
          
        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError);
          throw conversationsError;
        }
        
        // For each conversation, fetch all participants
        const conversationsWithParticipants = await Promise.all(
          conversationsData.map(async (conversation) => {
            // Get all participants for this conversation
            const { data: allParticipants, error: participantsError } = await supabase
              .from('conversation_participants')
              .select(`
                user_id,
                last_read_at,
                conversation_id
              `)
              .eq('conversation_id', conversation.id);
              
            if (participantsError) {
              console.error("Error fetching all participants:", participantsError);
              throw participantsError;
            }
            
            // Get profiles for all participants
            const userIds = allParticipants.map(p => p.user_id);
            
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', userIds);
              
            if (profilesError) {
              console.error("Error fetching profiles:", profilesError);
              throw profilesError;
            }
            
            // Combine participants with their profiles
            const participants = allParticipants.map(participant => {
              const profile = profiles?.find(p => p.id === participant.user_id);
              
              return {
                user_id: participant.user_id,
                conversation_id: participant.conversation_id,
                last_read_at: participant.last_read_at,
                profile: profile || null
              };
            });
            
            return {
              ...conversation,
              participants
            } as ChatConversation;
          })
        );
        
        setConversations(conversationsWithParticipants);
        console.log("Successfully loaded conversations:", conversationsWithParticipants.length);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError(error instanceof Error ? error : new Error('Failed to load conversations'));
        
        if (retryCount < 3) {
          toast({
            title: 'Error',
            description: 'Failed to load conversations. Retrying...',
            variant: 'destructive',
          });
          
          // Increment retry count to limit retries
          setRetryCount(prev => prev + 1);
        } else {
          toast({
            title: 'Connection Issues',
            description: 'Having trouble connecting to the chat service. Please try again later.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, toast, retryCount]);

  const updateLastRead = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      setError(null);
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating last read:', error);
      setError(error instanceof Error ? error : new Error('Failed to update last read timestamp'));
    }
  }, [user]);

  const resetErrors = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

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
