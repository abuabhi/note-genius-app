
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
        
        // Step 1: Get the conversation IDs where the user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', user.id);
          
        if (participantError) {
          console.error("Error fetching participant data:", participantError);
          throw participantError;
        }
        
        if (!participantData || participantData.length === 0) {
          console.log("No conversations found for user");
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        console.log(`Found ${participantData.length} conversations for user`);
        
        // Step 2: Get the conversation details
        const conversationIds = participantData.map(p => p.conversation_id);
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('chat_conversations')
          .select('*')
          .in('id', conversationIds)
          .order('last_message_at', { ascending: false });
          
        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError);
          throw conversationsError;
        }
        
        // Step 3: For each conversation, process the participants
        const processedConversations = await Promise.all(
          conversationsData.map(async (conversation) => {
            try {
              // Get all participants for this conversation
              const { data: allParticipantsData, error: allParticipantsError } = await supabase
                .from('conversation_participants')
                .select('user_id, last_read_at')
                .eq('conversation_id', conversation.id);
              
              if (allParticipantsError) {
                console.error("Error fetching all participants:", allParticipantsError);
                throw allParticipantsError;
              }
              
              // Step 4: Fetch profiles for each participant (including current user)
              const participants = await Promise.all(
                allParticipantsData.map(async (participant) => {
                  // Only fetch profile if not current user to reduce queries
                  try {
                    const { data: profileData, error: profileError } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', participant.user_id)
                      .single();
                    
                    if (profileError) {
                      console.error("Error fetching profile:", profileError);
                      return {
                        user_id: participant.user_id,
                        conversation_id: conversation.id,
                        last_read_at: participant.last_read_at,
                        profile: null
                      };
                    }
                    
                    return {
                      user_id: participant.user_id,
                      conversation_id: conversation.id,
                      last_read_at: participant.last_read_at,
                      profile: profileData
                    };
                  } catch (err) {
                    console.error("Error processing participant:", err);
                    return {
                      user_id: participant.user_id,
                      conversation_id: conversation.id,
                      last_read_at: participant.last_read_at,
                      profile: null
                    };
                  }
                })
              );
              
              return {
                ...conversation,
                participants
              } as ChatConversation;
            } catch (err) {
              console.error("Error processing conversation:", err);
              return null;
            }
          })
        );

        // Filter out null values (conversations where there was an error)
        setConversations(processedConversations.filter(c => c !== null) as ChatConversation[]);
        console.log("Successfully processed conversations:", processedConversations.length);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError(error instanceof Error ? error : new Error('Failed to load conversations'));
        toast({
          title: 'Error',
          description: 'Failed to load conversations. Retrying...',
          variant: 'destructive',
        });
        
        // Increment retry count to limit retries
        setRetryCount(prev => prev + 1);
      } finally {
        setLoadingConversations(false);
      }
    };

    // Only fetch if we haven't exceeded retry limit
    if (retryCount < 3) {
      fetchConversations();
    } else if (retryCount === 3) {
      // Final attempt notification
      toast({
        title: 'Connection Issues',
        description: 'Having trouble connecting to the chat service. Please try again later.',
        variant: 'destructive',
      });
      setError(new Error('Maximum retry attempts reached'));
      setLoadingConversations(false);
    }
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
