
import { Button } from "@/components/ui/button";
import { MessageSquareMore } from "lucide-react";

interface EmptyChatProps {
  onStartChat: () => void;
}

export const EmptyChat = ({ onStartChat }: EmptyChatProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <MessageSquareMore className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Start a conversation</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Connect with other users to share knowledge, ask questions, or collaborate on your studies.
      </p>
      <Button onClick={onStartChat}>Find connections</Button>
    </div>
  );
};
