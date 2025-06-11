
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { Note } from '@/types/note';
import { ChatSearch } from './ChatSearch';
import { ChatExport } from './ChatExport';
import { ChatUIMessage } from '../types/noteChat';

interface ChatHeaderProps {
  note: Note;
  messages: ChatUIMessage[];
  onMessageHighlight: (id: string | null) => void;
  onClose: () => void;
}

export const ChatHeader = ({ note, messages, onMessageHighlight, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-mint-50">
      <div className="flex items-center gap-2 flex-1">
        <MessageCircle className="h-5 w-5 text-mint-600" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">AI Chat Assistant</h3>
          <p className="text-xs text-gray-600 truncate" title={note.title}>
            {note.title}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ChatSearch 
          messages={messages}
          onMessageHighlight={onMessageHighlight}
        />
        <ChatExport messages={messages} note={note} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
