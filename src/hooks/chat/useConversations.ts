
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
        // Attempt to directly fetch conversations where the user is a participant
        // This avoids the potential RLS recursion issue
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('chat_conversations')
          .select(`
            id,
            created_at,
            updated_at,
            last_message_at
          `)
          .order('last_message_at', { ascending: false, nullsLast: true });
          
        if (conversationsError) throw conversationsError;
        
        if (!conversationsData || conversationsData.length === 0) {
          setConversations([]);
          setLoadingConversations(false);
          return;
        }
        
        // For each conversation, fetch participants data separately
        const processedConversations: ChatConversation[] = await Promise.all(
          conversationsData.map(async (conversation) => {
            try {
              // Get participant IDs for this conversation
              const { data: participantsData, error: participantsError } = await supabase
                .from('conversation_participants')
                .select('user_id, last_read_at')
                .eq('conversation_id', conversation.id);
                
              if (participantsError) throw participantsError;
              
              // If this conversation doesn't include the current user, skip it
              if (!participantsData?.some(p => p.user_id === user.id)) {
                return null;
              }
              
              // Fetch profiles for each participant
              const participants = await Promise.all(
                (participantsData || []).map(async (participant) => {
                  try {
                    const { data: profileData, error: profileError } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', participant.user_id)
                      .single();
                      
                    if (profileError) {
                      console.error('Error fetching profile:', profileError);
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
                    console.error('Error processing participant:', err);
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
              console.error('Error processing conversation:', err);
              return null;
            }
          })
        );

        // Filter out null values (conversations where there was an error or user isn't a participant)
        setConversations(processedConversations.filter(c => c !== null) as ChatConversation[]);
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
