
import { ChatMessage, ChatConversation, UserConnection } from "@/types/chat";
import { UserProfile } from "@/hooks/useRequireAuth";

export interface ChatState {
  conversations: ChatConversation[];
  connections: UserConnection[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  loadingConversations: boolean;
  loadingConnections: boolean;
  loadingMessages: boolean;
  error: Error | null;
}

export interface UseConversationsReturn {
  conversations: ChatConversation[];
  loadingConversations: boolean;
  setActiveConversationId: (id: string | null) => void;
  activeConversationId: string | null;
  updateLastRead: (conversationId: string) => Promise<void>;
  error: Error | null;
}

export interface UseMessagesReturn {
  messages: ChatMessage[];
  loadingMessages: boolean;
  sendMessage: ({ conversationId, message }: { conversationId: string, message: string }) => Promise<void>;
  subscribeToMessages: (conversationId: string, callback: (message: ChatMessage) => void) => () => void;
  error: Error | null;
}

export interface UseConnectionsReturn {
  connections: UserConnection[];
  loadingConnections: boolean;
  acceptConnectionRequest: (connectionId: string) => Promise<void>;
  declineConnectionRequest: (connectionId: string) => Promise<void>;
  error: Error | null;
}

export interface UseUserSearchReturn {
  searchUsers: (query: string) => Promise<UserProfile[]>;
  sendConnectionRequest: (receiverId: string) => Promise<void>;
  error: Error | null;
}
