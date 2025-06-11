
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { NoteChatMessages } from './NoteChatMessages';
import { NoteChatInput } from './NoteChatInput';
import { SmartSuggestions } from './components/SmartSuggestions';
import { ChatSearch } from './components/ChatSearch';
import { ChatExport } from './components/ChatExport';
import { FlashcardGeneration } from './components/FlashcardGeneration';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { useNoteChat } from './hooks/useNoteChat';
import { useStreamingChat } from './hooks/useStreamingChat';
import { useNoteChatHistory } from './hooks/useNoteChatHistory';
import { useSmartSuggestions } from './hooks/useSmartSuggestions';
import { useErrorHandler } from './hooks/useErrorHandler';
import { cn } from '@/lib/utils';
import { X, MessageCircle, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NoteChatSidebarProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteChatSidebar = ({ note, isOpen, onClose }: NoteChatSidebarProps) => {
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [useStreaming, setUseStreaming] = useState(true);
  
  const { sendMessage, isLoading, error } = useNoteChat(note);
  const { sendStreamingMessage, isStreaming, streamingMessage } = useStreamingChat(note);
  const { messages, addUserMessage, addMessage } = useNoteChatHistory(note.id);
  const { suggestions } = useSmartSuggestions(note);
  const { handleError, clearErrors, getLastError, canRetry } = useErrorHandler();

  const handleSendMessage = useCallback(async (message: string) => {
    try {
      clearErrors();
      
      // Add user message immediately
      const userMessage = addUserMessage(message);

      if (useStreaming) {
        // Use streaming for real-time response
        await sendStreamingMessage(
          message,
          messages,
          (content) => {
            // Handle streaming updates
          },
          (finalMessage) => {
            addMessage(finalMessage);
          }
        );
      } else {
        // Use regular response
        const aiResponse = await sendMessage(message, messages);
        if (aiResponse) {
          addMessage(aiResponse);
        }
      }
    } catch (error) {
      handleError(error, 'sending message');
    }
  }, [sendMessage, sendStreamingMessage, addUserMessage, addMessage, messages, useStreaming, handleError, clearErrors]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  const handleSelectFollowUp = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  const handleFlashcardCreated = useCallback(() => {
    setSelectedText('');
  }, []);

  // Helper function to get error message safely
  const getErrorMessage = () => {
    const lastError = getLastError();
    if (lastError) {
      return lastError.message;
    }
    if (error) {
      return typeof error === 'string' ? error : 'An error occurred';
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  const isProcessing = isLoading || isStreaming;

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
        {/* Header */}
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
          
          {/* Header actions */}
          <div className="flex items-center gap-2">
            <ChatSearch 
              messages={messages}
              onMessageHighlight={setHighlightedMessageId}
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

        {/* Error display */}
        {errorMessage && (
          <Alert className="m-3 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {errorMessage}
              {canRetry && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearErrors}
                  className="ml-2 p-0 h-auto text-red-700 underline"
                >
                  Dismiss
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for Chat and Flashcards */}
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
            {/* Smart Suggestions - only show when no messages */}
            {messages.length === 0 && (
              <div className="p-4 border-b">
                <SmartSuggestions 
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                  isLoading={isProcessing}
                />
              </div>
            )}

            {/* Messages */}
            <NoteChatMessages 
              messages={messages}
              note={note}
              isLoading={isLoading}
              isStreaming={isStreaming}
              streamingMessage={streamingMessage}
              onSelectFollowUp={handleSelectFollowUp}
              highlightedMessageId={highlightedMessageId}
            />

            {/* Input */}
            <NoteChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isProcessing}
            />
          </TabsContent>

          <TabsContent value="flashcards" className="flex-1 flex flex-col mt-0">
            <div className="p-4 flex-1">
              <FlashcardGeneration
                note={note}
                selectedText={selectedText}
                conversationContext={messages.slice(-2).map(m => m.content).join('\n')}
                onFlashcardCreated={handleFlashcardCreated}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AccessibilityProvider>
  );
};
