
import { NoteChatMessages } from '../NoteChatMessages';
import { NoteChatInput } from '../NoteChatInput';
import { SmartSuggestions } from './SmartSuggestions';
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
  onSelectSuggestion: (suggestion: string) => void;
  onSelectFollowUp: (question: string) => void;
  onSendMessage: (message: string) => Promise<void>;
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
  onSelectSuggestion,
  onSelectFollowUp,
  onSendMessage
}: ChatTabsProps) => {
  return (
    <div className="flex-1 flex flex-col">
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
    </div>
  );
};
