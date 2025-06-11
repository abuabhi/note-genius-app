
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { ChatUIMessage, NoteChatMessage } from '../types/noteChat';
import { toast } from 'sonner';

export const useNoteChat = (note: Note) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string, 
    previousMessages: ChatUIMessage[] = []
  ): Promise<ChatUIMessage | null> => {
    if (!message.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Create the context for the AI
      const noteContext = {
        title: note.title,
        content: note.content || note.description,
        subject: note.subject,
        enhancedContent: {
          summary: note.summary,
          keyPoints: note.key_points,
          improvedContent: note.improved_content,
          enrichedContent: note.enriched_content
        }
      };

      // Prepare conversation history for better context
      const conversationHistory = previousMessages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call the enhanced AI service with note context and conversation history
      const { data, error: aiError } = await supabase.functions.invoke('note-chat', {
        body: {
          message,
          noteContext,
          noteId: note.id,
          conversationHistory,
          enhancedFeatures: true
        }
      });

      if (aiError) {
        throw new Error(aiError.message || 'Failed to get AI response');
      }

      const aiResponse = data?.response || 'I apologize, but I cannot provide a response at the moment.';
      const followUpQuestions = data?.followUpQuestions || [];
      const suggestions = data?.suggestions || [];

      // Save the conversation to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { error: saveError } = await supabase
          .from('note_chat_messages')
          .insert({
            note_id: note.id,
            user_id: user.user.id,
            message: message.trim(),
            response: aiResponse
          });

        if (saveError) {
          console.error('Failed to save chat message:', saveError);
          // Don't throw here, still return the AI response
        }
      }

      // Return the AI response as a UI message with enhanced features
      return {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        followUpQuestions,
        suggestions
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [note]);

  return {
    sendMessage,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
