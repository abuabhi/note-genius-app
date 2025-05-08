
import { useState, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatContainer } from "./ChatContainer";
import { useChat } from "@/hooks/useChat";
import { EmptyChat } from "./EmptyChat";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const MobileChat = () => {
  const { activeConversationId } = useChat();
  const [showSidebar, setShowSidebar] = useState(true);

  const handleConversationSelect = () => {
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  // Effect to listen for conversation selection
  useEffect(() => {
    if (activeConversationId) {
      handleConversationSelect();
    }
  }, [activeConversationId]);

  const handleStartChat = () => {
    setShowSidebar(true);
  };

  return (
    <div className="md:hidden h-[calc(100vh-4rem)]">
      {showSidebar ? (
        <ChatSidebar />
      ) : activeConversationId ? (
        <ChatContainer onBack={handleBack} showBackButton={true} />
      ) : (
        <EmptyChat onStartChat={handleStartChat} />
      )}
      
      {/* Fixed button for quick access to find connections */}
      {!showSidebar && !activeConversationId && (
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            >
              <UserPlus className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <ChatSidebar />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
