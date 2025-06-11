
import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/chat";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/types/chat";
import { MessageRenderer } from "./MessageRenderer";

interface MessageListProps {
  conversationId: string;
}

export const MessageList = ({ conversationId }: MessageListProps) => {
  const { messages, loadingMessages, updateLastRead, subscribeToMessages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    // Mark messages as read when conversation is opened
    updateLastRead(conversationId);
    
    // Subscribe to new messages for this conversation
    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      // If message is from someone else, mark as read
      if (newMessage.sender_id !== user?.id) {
        updateLastRead(conversationId);
      }
    });
    
    return unsubscribe;
  }, [conversationId, user?.id, updateLastRead, subscribeToMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name?.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase() || '?';
  };

  const renderMessageGroup = (message: ChatMessage, index: number, messagesArray: ChatMessage[]) => {
    const isCurrentUser = message.sender_id === user?.id;
    const previousMessage = index > 0 ? messagesArray[index - 1] : null;
    const isPreviousSameSender = previousMessage && previousMessage.sender_id === message.sender_id;
    
    // Only render the avatar for the first message in a group
    const showAvatar = !isPreviousSameSender && !isCurrentUser;
    
    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        {!isCurrentUser && (
          <div className="flex-shrink-0 w-8">
            {showAvatar && (
              <Avatar className="h-8 w-8">
                {message.sender?.avatar_url ? (
                  <AvatarImage src={message.sender.avatar_url} alt={message.sender.username || ''} />
                ) : (
                  <AvatarFallback>{getInitials(message.sender?.username || '')}</AvatarFallback>
                )}
              </Avatar>
            )}
          </div>
        )}
        
        <div
          className={`px-4 py-3 rounded-lg max-w-[80%] ${
            isCurrentUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-accent"
          }`}
        >
          <MessageRenderer 
            content={message.message}
            isCurrentUser={isCurrentUser}
          />
          <div className={`text-xs mt-2 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {formatTime(message.created_at)}
          </div>
        </div>

        {isCurrentUser && (
          <div className="flex-shrink-0 w-8">
            <Avatar className="h-8 w-8">
              {user?.user_metadata?.avatar_url ? (
                <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.username || ''} />
              ) : (
                <AvatarFallback>{getInitials(user?.user_metadata?.username || user?.email || '')}</AvatarFallback>
              )}
            </Avatar>
          </div>
        )}
      </div>
    );
  };

  if (loadingMessages) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4"
      style={{ height: 'calc(100vh - 12rem)' }}
    >
      {messages && messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message, index, array) => renderMessageGroup(message, index, array))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-full text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      )}
    </div>
  );
};
