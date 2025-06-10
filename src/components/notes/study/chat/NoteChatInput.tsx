
import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface NoteChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export const NoteChatInput = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Ask a question about this note..." 
}: NoteChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const messageToSend = message.trim();
    setMessage('');
    await onSendMessage(messageToSend);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-white">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[44px] max-h-32 resize-none"
        disabled={isLoading}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        size="icon"
        className="h-11 w-11 bg-mint-500 hover:bg-mint-600"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
