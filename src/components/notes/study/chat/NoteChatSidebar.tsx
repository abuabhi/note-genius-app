
import { useState } from 'react';
import { Note } from '@/types/note';
import { useSmartSuggestions } from './hooks/useSmartSuggestions';
import { useChatHandlers } from './hooks/useChatHandlers';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { ChatHeader } from './components/ChatHeader';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ChatTabs } from './components/ChatTabs';
import { cn } from '@/lib/utils';

interface NoteChatSidebarProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteChatSidebar = ({ note, isOpen, onClose }: NoteChatSidebarProps) => {
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  
  const { suggestions } = useSmartSuggestions(note);
  const {
    messages,
    selectedText,
    isProcessing,
    isLoading,
    isStreaming,
    streamingMessage,
    errorMessage,
    canRetry,
    handleSendMessage,
    handleSelectSuggestion,
    handleSelectFollowUp,
    handleFlashcardCreated,
    handleClearChat,
    clearErrors
  } = useChatHandlers(note);

  return (
    <AccessibilityProvider>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="AI Chat Assistant"
        aria-modal="true"
      >
        <ChatHeader
          note={note}
          messages={messages}
          onMessageHighlight={setHighlightedMessageId}
          onClose={onClose}
          onClearChat={handleClearChat}
        />

        <ErrorDisplay
          errorMessage={errorMessage}
          canRetry={canRetry}
          onClearErrors={clearErrors}
        />

        <ChatTabs
          note={note}
          messages={messages}
          suggestions={suggestions}
          isProcessing={isProcessing}
          isLoading={isLoading}
          isStreaming={isStreaming}
          streamingMessage={streamingMessage}
          highlightedMessageId={highlightedMessageId}
          selectedText={selectedText}
          onSelectSuggestion={handleSelectSuggestion}
          onSelectFollowUp={handleSelectFollowUp}
          onSendMessage={handleSendMessage}
          onFlashcardCreated={handleFlashcardCreated}
        />
      </div>
    </AccessibilityProvider>
  );
};
