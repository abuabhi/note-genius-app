
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation, ConversationParticipant } from '@/types/chat';

/**
 * Fetches conversation IDs where the user is a participant
 */
export const fetchUserConversationIds = async (userId: string) => {
  try {
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);
      
    if (participantError) {
      console.error("Error fetching participants:", participantError);
      throw participantError;
    }
    
    return participantData || [];
  } catch (error) {
    console.error("Error in fetchUserConversationIds:", error);
    // Return empty array instead of throwing to prevent infinite retries
    return [];
  }
};

/**
 * Fetches conversation data for a list of conversation IDs
 */
export const fetchConversationsData = async (conversationIds: string[]) => {
  if (!conversationIds.length) return [];
  
  try {
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
  } catch (error) {
    console.error("Error in fetchConversationsData:", error);
    return [];
  }
};

/**
 * Fetches participants for a conversation
 */
export const fetchConversationParticipants = async (conversationId: string) => {
  try {
    // Directly query conversation_participants without additional filtering
    const { data: allParticipants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('id, user_id, conversation_id, created_at, last_read_at')
      .eq('conversation_id', conversationId);
      
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }
    
    return allParticipants || [];
  } catch (error) {
    console.error("Error in fetchConversationParticipants:", error);
    return [];
  }
};

/**
 * Fetches user profiles for a list of user IDs
 */
export const fetchUserProfiles = async (userIds: string[]) => {
  if (!userIds.length) return [];
  
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, user_tier')
      .in('id', userIds);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }
    
    return profiles || [];
  } catch (error) {
    console.error("Error in fetchUserProfiles:", error);
    return [];
  }
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
    // Don't throw to prevent crashes
  }
};
