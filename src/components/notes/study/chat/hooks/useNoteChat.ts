
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { ChatUIMessage, NoteChatMessage } from '../types/noteChat';
import { toast } from 'sonner';

export const useNoteChat = (note: Note) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<ChatUIMessage | null> => {
    if (!message.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Create the context for the AI
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

      // Call the AI service with note context
      const { data, error: aiError } = await supabase.functions.invoke('note-chat', {
        body: {
          message,
          noteContext,
          noteId: note.id
        }
      });

      if (aiError) {
        throw new Error(aiError.message || 'Failed to get AI response');
      }

      const aiResponse = data?.response || 'I apologize, but I cannot provide a response at the moment.';

      // Save the conversation to database
      const { data: savedMessage, error: saveError } = await supabase
        .from('note_chat_messages')
        .insert({
          note_id: note.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          message: message.trim(),
          response: aiResponse
        })
        .select()
        .single();

      if (saveError) {
        console.error('Failed to save chat message:', saveError);
        // Don't throw here, still return the AI response
      }

      // Return the AI response as a UI message
      return {
        id: savedMessage?.id || `temp-${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
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
