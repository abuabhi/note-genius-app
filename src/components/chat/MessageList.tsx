
import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/chat";

interface MessageListProps {
  conversationId: string;
}

export const MessageList = ({ conversationId }: MessageListProps) => {
  const { messages, loadingMessages, updateLastRead, subscribeToMessages } = useChat();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to new messages
  useEffect(() => {
    // Mark messages as read when conversation is opened
    updateLastRead(conversationId);
    
    // Scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Subscribe to new messages for this conversation
    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      // If message is from someone else, mark as read
      if (newMessage.sender_id !== user?.id) {
        updateLastRead(conversationId);
      }
    });
    
    return unsubscribe;
  }, [conversationId, messages, user?.id, updateLastRead, subscribeToMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        className={`flex gap-2 mb-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}
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
          className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
            isCurrentUser 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-accent"
          }`}
        >
          {message.message}
          <div className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {formatTime(message.created_at)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-16rem)] p-4">
      {loadingMessages ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message, index, array) => renderMessageGroup(message, index, array))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-full text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      )}
    </ScrollArea>
  );
};
