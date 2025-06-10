
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { ChatUIMessage } from '../types/noteChat';
import { toast } from 'sonner';

export const useStreamingChat = (note: Note) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const sendStreamingMessage = useCallback(async (
    message: string,
    previousMessages: ChatUIMessage[] = [],
    onStreamUpdate: (content: string) => void,
    onStreamComplete: (finalMessage: ChatUIMessage) => void
  ) => {
    if (!message.trim()) return;

    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);

    try {
      const noteContext = {
        title: note.title,
        content: note.content || note.description,
        subject: note.category,
        enhancedContent: {
          summary: note.summary,
          keyPoints: note.key_points,
          improvedContent: note.improved_content,
          enrichedContent: note.enriched_content
        }
      };

      const conversationHistory = previousMessages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error: functionError } = await supabase.functions.invoke('note-chat-streaming', {
        body: {
          message,
          noteContext,
          noteId: note.id,
          conversationHistory,
          streaming: true
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to start streaming');
      }

      // Simulate streaming for now (real streaming would use SSE or WebSocket)
      const fullResponse = data?.response || 'I apologize, but I cannot provide a response at the moment.';
      const words = fullResponse.split(' ');
      let currentContent = '';

      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i];
        setStreamingMessage(currentContent);
        onStreamUpdate(currentContent);
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const finalMessage: ChatUIMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        followUpQuestions: data?.followUpQuestions || [],
        suggestions: data?.suggestions || []
      };

      onStreamComplete(finalMessage);

      // Save to database
      await supabase.from('note_chat_messages').insert({
        note_id: note.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message: message.trim(),
        response: fullResponse
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [note]);

  return {
    sendStreamingMessage,
    isStreaming,
    streamingMessage,
    error,
    clearError: () => setError(null)
  };
};
