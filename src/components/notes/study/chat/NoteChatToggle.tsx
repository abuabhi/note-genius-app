
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NoteChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  hasUnread?: boolean;
}

export const NoteChatToggle = ({ isOpen, onToggle, hasUnread }: NoteChatToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
        "bg-mint-500 hover:bg-mint-600 text-white",
        isOpen && "bg-gray-500 hover:bg-gray-600"
      )}
      size="icon"
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          )}
        </div>
      )}
    </Button>
  );
};
