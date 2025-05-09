
import { ChatConversation, ConversationParticipant } from "@/types/chat";
import { UserProfile } from "@/hooks/useRequireAuth";

/**
 * Maps participants with their profiles
 */
export const mapParticipantsWithProfiles = (
  participants: any[], 
  profiles: any[]
): ConversationParticipant[] => {
  return participants.map(participant => {
    const profile = profiles?.find(p => p.id === participant.user_id);
    
    return {
      id: participant.id,
      user_id: participant.user_id,
      conversation_id: participant.conversation_id,
      last_read_at: participant.last_read_at,
      created_at: participant.created_at || new Date().toISOString(),
      profile: profile || null
    };
  });
};

/**
 * Assembles a conversation with participants data
 */
export const assembleConversation = (
  conversation: any,
  participants: ConversationParticipant[]
): ChatConversation => {
  return {
    ...conversation,
    participants
  } as ChatConversation;
};

/**
 * Assembles multiple conversations with their participants
 */
export const assembleConversations = async (
  conversationsData: any[],
  fetchParticipantsForConversation: (conversationId: string) => Promise<ConversationParticipant[]>
): Promise<ChatConversation[]> => {
  try {
    // Process each conversation to add participants
    const conversationsWithParticipants = await Promise.all(
      conversationsData.map(async (conversation) => {
        try {
          const participants = await fetchParticipantsForConversation(conversation.id);
          return assembleConversation(conversation, participants);
        } catch (error) {
          console.error(`Error processing conversation ${conversation.id}:`, error);
          // Return conversation without participants rather than failing the entire operation
          return {
            ...conversation,
            participants: []
          } as ChatConversation;
        }
      })
    );
    
    return conversationsWithParticipants;
  } catch (error) {
    console.error("Error in assembleConversations:", error);
    return [];
  }
};
