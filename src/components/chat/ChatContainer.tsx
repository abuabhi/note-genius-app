
import { useState } from "react";
import { useChat } from "@/hooks/chat";
import { ChatSidebar } from "./ChatSidebar";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatContainer = () => {
  const { activeConversationId, conversations } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const getConversationTitle = () => {
    if (!activeConversation?.participants) return "Chat";
    
    const otherParticipants = activeConversation.participants.filter(
      p => p.profile && p.profile.username
    );
    
    if (otherParticipants.length === 0) return "Chat";
    
    return otherParticipants.map(p => p.profile?.username).join(", ");
  };

  return (
    <div className="flex h-full max-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative z-50 md:z-0 h-full",
        "w-80 bg-background border-r",
        "transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h2 className="font-semibold text-lg truncate">
                  {getConversationTitle()}
                </h2>
              </div>
              {sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Messages */}
            <MessageList conversationId={activeConversationId} />

            {/* Message input */}
            <div className="border-t bg-background p-4">
              <MessageInput conversationId={activeConversationId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Mobile menu button when no conversation selected */}
            <div className="flex items-center justify-between p-4 border-b bg-background md:hidden">
              <h2 className="font-semibold text-lg">Chat</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* Empty state */}
            <div className="flex-1 flex items-center justify-center p-8">
              <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Welcome to Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Select a conversation from the sidebar to start chatting, or create a new connection to begin messaging with other users.
                  </p>
                  <Button 
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden"
                  >
                    View Conversations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
