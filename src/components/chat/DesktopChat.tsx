
import { ChatSidebar } from "./ChatSidebar";
import { ChatContainer } from "./ChatContainer";
import { EmptyChat } from "./EmptyChat";
import { useChat } from "@/hooks/chat"; // Updated import path
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const DesktopChat = () => {
  const { activeConversationId } = useChat();

  const handleStartChat = () => {
    // Open sheet by simulating a click on the button
    document.querySelector('[data-testid="find-connections-trigger"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  };

  return (
    <div className="hidden md:grid md:grid-cols-[300px_1fr] h-[calc(100vh-4rem)]">
      <ChatSidebar />
      
      {activeConversationId ? (
        <ChatContainer />
      ) : (
        <div className="relative">
          <EmptyChat onStartChat={handleStartChat} />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                data-testid="find-connections-trigger"
                className="hidden"
              >
                Find connections
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-4">Find Connections</h2>
                {/* Sheet content would go here if needed */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};
