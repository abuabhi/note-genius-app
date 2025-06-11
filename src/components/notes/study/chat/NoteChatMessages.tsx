import { useEffect, useRef, useState } from 'react';
import { ChatUIMessage } from './types/noteChat';
import { cn } from '@/lib/utils';
import { User, Bot, BookOpen, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { FollowUpQuestions } from './components/FollowUpQuestions';
import { MessageFeedback } from './components/MessageFeedback';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFlashcardIntegration } from './hooks/useFlashcardIntegration';
import { useAccessibility } from './components/AccessibilityProvider';
import { MessageRenderer } from '@/components/chat/MessageRenderer';
import { FlashcardSetSelectionModal } from './components/FlashcardSetSelectionModal';
import { Note } from '@/types/note';

interface NoteChatMessagesProps {
  messages: ChatUIMessage[];
  note: Note;
  isLoading?: boolean;
  isStreaming?: boolean;
  streamingMessage?: string;
  onSelectFollowUp?: (question: string) => void;
  highlightedMessageId?: string | null;
}

export const NoteChatMessages = ({ 
  messages,
  note,
  isLoading,
  isStreaming,
  streamingMessage,
  onSelectFollowUp,
  highlightedMessageId
}: NoteChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { 
    generateFlashcardFromChat, 
    isGenerating,
    showSetSelection,
    suggestedSetId,
    lastCreatedFlashcardId,
    handleSetSelection,
    handleModalClose,
    showChooseDifferentSet,
    pendingFlashcard
  } = useFlashcardIntegration(note);
  const { announceMessage } = useAccessibility();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Announce new messages for screen readers
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai') {
        announceMessage(`AI response: ${lastMessage.content.slice(0, 100)}...`);
      }
    }
  }, [messages, announceMessage]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId) {
      const messageElement = messageRefs.current.get(highlightedMessageId);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedMessageId]);

  const handleMessageFeedback = (messageId: string, type: 'helpful' | 'unhelpful') => {
    console.log('Message feedback:', messageId, type);
    announceMessage(`Feedback recorded: ${type}`);
  };

  const handleCreateFlashcard = async (question: string, answer: string, showModal: boolean = false) => {
    try {
      await generateFlashcardFromChat(question, answer, undefined, showModal);
      if (!showModal) {
        announceMessage('Flashcard created successfully');
      }
    } catch (error) {
      announceMessage('Failed to create flashcard');
    }
  };

  if (messages.length === 0 && !isLoading && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-xs">
          <Bot className="h-12 w-12 text-mint-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ask about your note
          </h3>
          <p className="text-sm text-gray-600">
            I can help answer questions, explain concepts, provide summaries, or create practice questions about the content in this note.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)]"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        {messages.map((message) => (
          <div key={message.id}>
            <div
              ref={(el) => {
                if (el) {
                  messageRefs.current.set(message.id, el);
                }
              }}
              className={cn(
                "flex gap-3 group",
                message.type === 'user' ? 'justify-end' : 'justify-start',
                highlightedMessageId === message.id && "bg-yellow-100 -mx-2 px-2 py-1 rounded-lg transition-colors"
              )}
              role="article"
              aria-label={`${message.type === 'user' ? 'User' : 'AI'} message`}
            >
              {message.type === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-mint-600" aria-hidden="true" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 relative",
                  message.type === 'user'
                    ? 'bg-mint-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                <div className="text-sm">
                  <MessageRenderer 
                    content={message.content}
                    isCurrentUser={message.type === 'user'}
                  />
                </div>
                <div
                  className={cn(
                    "text-xs mt-1 opacity-70",
                    message.type === 'user' ? 'text-mint-100' : 'text-gray-500'
                  )}
                  aria-label={`Message sent at ${format(new Date(message.timestamp), 'HH:mm')}`}
                >
                  {format(new Date(message.timestamp), 'HH:mm')}
                </div>
                
                {/* Message feedback for AI messages */}
                {message.type === 'ai' && (
                  <MessageFeedback
                    messageId={message.id}
                    content={message.content}
                    onFeedback={handleMessageFeedback}
                  />
                )}

                {/* Enhanced Flashcard creation button for AI messages */}
                {message.type === 'ai' && (
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const messageIndex = messages.findIndex(m => m.id === message.id);
                          const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
                          if (userMessage && userMessage.type === 'user') {
                            handleCreateFlashcard(userMessage.content, message.content);
                          }
                        }}
                        disabled={isGenerating}
                        className="h-6 text-xs"
                        aria-label="Create flashcard automatically"
                      >
                        <BookOpen className="h-3 w-3 mr-1" aria-hidden="true" />
                        {isGenerating ? 'Creating...' : 'Quick Create'}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            aria-label="More flashcard options"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              const messageIndex = messages.findIndex(m => m.id === message.id);
                              const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
                              if (userMessage && userMessage.type === 'user') {
                                handleCreateFlashcard(userMessage.content, message.content, true);
                              }
                            }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Choose Set...
                          </DropdownMenuItem>
                          {lastCreatedFlashcardId && (
                            <DropdownMenuItem onClick={showChooseDifferentSet}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Move to Different Set
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-mint-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
              )}
            </div>
            
            {/* Follow-up questions for AI messages */}
            {message.type === 'ai' && message.followUpQuestions && message.followUpQuestions.length > 0 && onSelectFollowUp && (
              <div className="ml-11 mt-2">
                <FollowUpQuestions 
                  questions={message.followUpQuestions}
                  onSelectQuestion={onSelectFollowUp}
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Streaming message display */}
        {isStreaming && streamingMessage && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-mint-600" aria-hidden="true" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="text-sm">
                <MessageRenderer 
                  content={streamingMessage}
                  isCurrentUser={false}
                />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <div className="flex gap-3 justify-start" role="status" aria-label="AI is thinking">
            <div className="flex-shrink-0 w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-mint-600" aria-hidden="true" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Flashcard Set Selection Modal */}
      <FlashcardSetSelectionModal
        isOpen={showSetSelection}
        onClose={handleModalClose}
        onSelectSet={handleSetSelection}
        noteTitle={note.title}
        noteCategory={note.category}
        suggestedSetId={suggestedSetId}
      />
    </>
  );
};
