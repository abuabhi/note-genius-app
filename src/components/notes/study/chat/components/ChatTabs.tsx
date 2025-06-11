
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, BookOpen } from 'lucide-react';
import { NoteChatMessages } from '../NoteChatMessages';
import { NoteChatInput } from '../NoteChatInput';
import { SmartSuggestions } from './SmartSuggestions';
import { FlashcardGeneration } from './FlashcardGeneration';
import { Note } from '@/types/note';
import { ChatUIMessage } from '../types/noteChat';
import { SmartSuggestion } from '../types/suggestions';

interface ChatTabsProps {
  note: Note;
  messages: ChatUIMessage[];
  suggestions: SmartSuggestion[];
  isProcessing: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  highlightedMessageId: string | null;
  selectedText: string;
  onSelectSuggestion: (suggestion: string) => void;
  onSelectFollowUp: (question: string) => void;
  onSendMessage: (message: string) => Promise<void>;
  onFlashcardCreated: () => void;
}

export const ChatTabs = ({
  note,
  messages,
  suggestions,
  isProcessing,
  isLoading,
  isStreaming,
  streamingMessage,
  highlightedMessageId,
  selectedText,
  onSelectSuggestion,
  onSelectFollowUp,
  onSendMessage,
  onFlashcardCreated
}: ChatTabsProps) => {
  return (
    <Tabs defaultValue="chat" className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="flashcards" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Flashcards
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
        {messages.length === 0 && (
          <div className="p-4 border-b">
            <SmartSuggestions 
              suggestions={suggestions}
              onSelectSuggestion={onSelectSuggestion}
              isLoading={isProcessing}
            />
          </div>
        )}

        <NoteChatMessages 
          messages={messages}
          note={note}
          isLoading={isLoading}
          isStreaming={isStreaming}
          streamingMessage={streamingMessage}
          onSelectFollowUp={onSelectFollowUp}
          highlightedMessageId={highlightedMessageId}
        />

        <NoteChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isProcessing}
        />
      </TabsContent>

      <TabsContent value="flashcards" className="flex-1 flex flex-col mt-0">
        <div className="p-4 flex-1">
          <FlashcardGeneration
            note={note}
            selectedText={selectedText}
            conversationContext={messages.slice(-2).map(m => m.content).join('\n')}
            onFlashcardCreated={onFlashcardCreated}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
