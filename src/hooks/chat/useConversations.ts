
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

  // Fetch conversations for current user
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      setError(null);
      try {
        // First, get all conversation IDs where the user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (participantError) throw participantError;
        
        if (!participantData || participantData.length === 0) {
          setConversations([]);
          setLoadingConversations(false);
          return;
        }

        const conversationIds = participantData.map(p => p.conversation_id);
        
        // Fetch conversation details
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('chat_conversations')
          .select('*')
          .in('id', conversationIds);
          
        if (conversationsError) throw conversationsError;
        
        // For each conversation, fetch participants with their complete data
        const processedConversations: ChatConversation[] = await Promise.all(
          conversationsData.map(async (conversation) => {
            const { data: participantsData, error: participantsError } = await supabase
              .from('conversation_participants')
              .select(`
                id,
                conversation_id,
                user_id,
                created_at,
                last_read_at
              `)
              .eq('conversation_id', conversation.id);
              
            if (participantsError) throw participantsError;
            
            // Fetch profiles separately for each participant
            const participants = await Promise.all(
              (participantsData || []).map(async (participant) => {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', participant.user_id)
                  .single();
                  
                if (profileError) {
                  console.error('Error fetching profile:', profileError);
                  return {
                    ...participant,
                    profile: null
                  };
                }
                
                return {
                  ...participant,
                  profile: profileData
                };
              })
            );
            
            return {
              ...conversation,
              participants: participants
            } as ChatConversation;
          })
        );

        setConversations(processedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError(error instanceof Error ? error : new Error('Failed to load conversations'));
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user, toast]);

  const updateLastRead = useCallback(async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
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

  return {
    conversations,
    loadingConversations,
    setActiveConversationId,
    activeConversationId,
    updateLastRead,
    error,
  };
};
