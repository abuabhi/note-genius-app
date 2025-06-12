
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatFloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasUnreadChat?: boolean;
}

export const ChatFloatingButton = ({ 
  onClick, 
  isOpen, 
  hasUnreadChat = false 
}: ChatFloatingButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-purple-500 hover:bg-purple-600 transition-all duration-200 group"
      aria-label={isOpen ? "Close Chat" : "Open Chat"}
    >
      <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      {hasUnreadChat && !isOpen && (
        <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
};
