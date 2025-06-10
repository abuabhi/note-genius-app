
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { NoteChatMessages } from './NoteChatMessages';
import { NoteChatInput } from './NoteChatInput';
import { SmartSuggestions } from './components/SmartSuggestions';
import { useNoteChat } from './hooks/useNoteChat';
import { useNoteChatHistory } from './hooks/useNoteChatHistory';
import { useSmartSuggestions } from './hooks/useSmartSuggestions';
import { cn } from '@/lib/utils';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoteChatSidebarProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteChatSidebar = ({ note, isOpen, onClose }: NoteChatSidebarProps) => {
  const { sendMessage, isLoading, error } = useNoteChat(note);
  const { messages, addUserMessage, addMessage } = useNoteChatHistory(note.id);
  const { suggestions } = useSmartSuggestions(note);

  const handleSendMessage = useCallback(async (message: string) => {
    // Add user message immediately
    addUserMessage(message);

    // Send to AI and get response with conversation context
    const aiResponse = await sendMessage(message, messages);
    if (aiResponse) {
      addMessage(aiResponse);
    }
  }, [sendMessage, addUserMessage, addMessage, messages]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  const handleSelectFollowUp = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-mint-50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-mint-600" />
            <div>
              <h3 className="font-medium text-gray-900">AI Chat Assistant</h3>
              <p className="text-xs text-gray-600 truncate max-w-48">
                {note.title}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Smart Suggestions - only show when no messages */}
        {messages.length === 0 && (
          <div className="p-4 border-b">
            <SmartSuggestions 
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Messages */}
        <NoteChatMessages 
          messages={messages} 
          isLoading={isLoading}
          onSelectFollowUp={handleSelectFollowUp}
        />

        {/* Input */}
        <NoteChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </>
  );
};
