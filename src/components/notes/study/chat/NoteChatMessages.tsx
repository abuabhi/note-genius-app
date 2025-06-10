
import { useEffect, useRef } from 'react';
import { ChatUIMessage } from './types/noteChat';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { FollowUpQuestions } from './components/FollowUpQuestions';

interface NoteChatMessagesProps {
  messages: ChatUIMessage[];
  isLoading?: boolean;
  onSelectFollowUp?: (question: string) => void;
}

export const NoteChatMessages = ({ 
  messages, 
  isLoading,
  onSelectFollowUp 
}: NoteChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          <div
            className={cn(
              "flex gap-3",
              message.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.type === 'ai' && (
              <div className="flex-shrink-0 w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-mint-600" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.type === 'user'
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              )}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              <div
                className={cn(
                  "text-xs mt-1 opacity-70",
                  message.type === 'user' ? 'text-mint-100' : 'text-gray-500'
                )}
              >
                {format(new Date(message.timestamp), 'HH:mm')}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-mint-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
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
      
      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-mint-600" />
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
  );
};
