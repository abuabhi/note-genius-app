
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
        
        // Step 1: Get conversations directly with a more efficient query
        // Avoiding the recursion by not joining on conversation_participants table
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('chat_conversations')
          .select(`
            id,
            created_at,
            updated_at,
            last_message_at
          `)
          .order('last_message_at', { ascending: false });
          
        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError);
          throw conversationsError;
        }
        
        if (!conversationsData || conversationsData.length === 0) {
          console.log("No conversations found for user");
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        console.log(`Found ${conversationsData.length} potential conversations`);
        
        // Step 2: For each conversation, check if the user is a participant
        const userConversations = [];
        
        for (const conversation of conversationsData) {
          try {
            // Check if user is participant in this conversation
            const { data: participantData, error: participantError } = await supabase
              .from('conversation_participants')
              .select('*')
              .eq('conversation_id', conversation.id)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (participantError) {
              console.error("Error checking participant:", participantError);
              continue;
            }
            
            if (!participantData) {
              continue; // User is not a participant in this conversation
            }
            
            // Get other participants for this conversation
            const { data: otherParticipantsData, error: otherParticipantsError } = await supabase
              .from('conversation_participants')
              .select('user_id, last_read_at')
              .eq('conversation_id', conversation.id)
              .neq('user_id', user.id);
              
            if (otherParticipantsError) {
              console.error("Error fetching other participants:", otherParticipantsError);
              continue;
            }
            
            // If no other participants, skip this conversation
            if (!otherParticipantsData || otherParticipantsData.length === 0) {
              continue;
            }
            
            // Get profiles for other participants
            const otherParticipantIds = otherParticipantsData.map(p => p.user_id);
            
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', otherParticipantIds);
              
            if (profilesError) {
              console.error("Error fetching profiles:", profilesError);
              continue;
            }
            
            // Add current user as participant
            const participants = [
              {
                user_id: user.id,
                conversation_id: conversation.id,
                last_read_at: participantData.last_read_at,
                profile: null // We don't need current user's profile
              }
            ];
            
            // Add other participants with their profiles
            otherParticipantsData.forEach(participant => {
              const profile = profilesData?.find(p => p.id === participant.user_id);
              participants.push({
                user_id: participant.user_id,
                conversation_id: conversation.id,
                last_read_at: participant.last_read_at,
                profile: profile || null
              });
            });
            
            // Add conversation with participants to the list
            userConversations.push({
              ...conversation,
              participants
            });
          } catch (err) {
            console.error("Error processing conversation:", err);
            continue;
          }
        }

        setConversations(userConversations);
        console.log("Successfully processed conversations:", userConversations.length);
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
