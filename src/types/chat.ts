
import { UserProfile } from "@/hooks/useRequireAuth";

export interface UserConnection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  participants?: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  last_read_at: string | null;
  profile?: UserProfile | any; // Allow any for now to fix type errors
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender?: UserProfile | any; // Allow any for now to fix type errors
}

// Update TierLimits to include chat_enabled
export interface TierLimits {
  collaboration_enabled: boolean;
  chat_enabled?: boolean;
  // Add other tier limits as needed
}
