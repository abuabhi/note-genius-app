
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Trash2 } from 'lucide-react';
import { Note } from '@/types/note';
import { ChatSearch } from './ChatSearch';
import { ChatExport } from './ChatExport';
import { ChatUIMessage } from '../types/noteChat';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatHeaderProps {
  note: Note;
  messages: ChatUIMessage[];
  onMessageHighlight: (id: string | null) => void;
  onClose: () => void;
  onClearChat?: () => void;
}

export const ChatHeader = ({ note, messages, onMessageHighlight, onClose, onClearChat }: ChatHeaderProps) => {
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
        
        {/* Clear Chat Button */}
        {messages.length > 0 && onClearChat && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to clear all chat messages? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearChat}>
                  Clear Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
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
