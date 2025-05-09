
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation, ConversationParticipant } from '@/types/chat';

/**
 * Fetches conversation IDs where the user is a participant
 */
export const fetchUserConversationIds = async (userId: string) => {
  const { data: participantData, error: participantError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);
    
  if (participantError) {
    console.error("Error fetching participants:", participantError);
    throw participantError;
  }
  
  return participantData || [];
};

/**
 * Fetches conversation data for a list of conversation IDs
 */
export const fetchConversationsData = async (conversationIds: string[]) => {
  if (!conversationIds.length) return [];
  
  const { data: conversationsData, error: conversationsError } = await supabase
    .from('chat_conversations')
    .select('*')
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false });
    
  if (conversationsError) {
    console.error("Error fetching conversations:", conversationsError);
    throw conversationsError;
  }
  
  return conversationsData || [];
};

/**
 * Fetches participants for a conversation
 */
export const fetchConversationParticipants = async (conversationId: string) => {
  const { data: allParticipants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select(`
      user_id,
      last_read_at,
      conversation_id
    `)
    .eq('conversation_id', conversationId);
    
  if (participantsError) {
    console.error("Error fetching participants:", participantsError);
    throw participantsError;
  }
  
  return allParticipants || [];
};

/**
 * Fetches user profiles for a list of user IDs
 */
export const fetchUserProfiles = async (userIds: string[]) => {
  if (!userIds.length) return [];
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);
    
  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw profilesError;
  }
  
  return profiles || [];
};

/**
 * Updates the last read timestamp for a user in a conversation
 */
export const updateConversationLastRead = async (conversationId: string, userId: string) => {
  try {
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error updating last read:', error);
    throw error instanceof Error ? error : new Error('Failed to update last read timestamp');
  }
};
