
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/chat"; // Updated import path
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/hooks/useRequireAuth";

interface ChatContainerProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ChatContainer = ({ 
  onBack, 
  showBackButton = false 
}: ChatContainerProps) => {
  const { activeConversationId, conversations } = useChat();
  const { user } = useAuth();
  const [otherParticipant, setOtherParticipant] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (activeConversationId && conversations) {
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (conversation?.participants) {
        const other = conversation.participants.find(p => p.user_id !== user?.id);
        setOtherParticipant(other?.profile || null);
      }
    }
  }, [activeConversationId, conversations, user?.id]);
  
  const getInitials = (name: string) => {
    return name?.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase() || '?';
  };

  if (!activeConversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p>Choose a conversation from the sidebar or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar>
          {otherParticipant?.avatar_url ? (
            <AvatarImage src={otherParticipant.avatar_url} />
          ) : (
            <AvatarFallback>{getInitials(otherParticipant?.username || '')}</AvatarFallback>
          )}
        </Avatar>
        <div className="ml-3">
          <p className="font-medium">{otherParticipant?.username || 'User'}</p>
          <p className="text-xs text-muted-foreground">
            {otherParticipant?.user_tier || ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList conversationId={activeConversationId} />
      </div>

      <Separator />
      
      <MessageInput conversationId={activeConversationId} />
    </div>
  );
};
