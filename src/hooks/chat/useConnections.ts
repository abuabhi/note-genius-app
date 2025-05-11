import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserConnection } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { UseConnectionsReturn } from './types';

export const useConnections = (): UseConnectionsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch connections for current user
  useEffect(() => {
    if (!user) return;

    const fetchConnections = async () => {
      setLoadingConnections(true);
      setError(null);
      try {
        // Get connections where user is either sender or receiver
        const { data, error } = await supabase
          .from('user_connections')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) throw error;
        
        // Ensure the status is of the correct type
        const typedConnections = data.map(conn => ({
          ...conn,
          status: conn.status as 'pending' | 'accepted' | 'declined' | 'blocked'
        }));
        
        setConnections(typedConnections);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setError(error instanceof Error ? error : new Error('Failed to load connections'));
        toast({
          title: 'Error',
          description: 'Failed to load connections',
          variant: 'destructive',
        });
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchConnections();
  }, [user, toast]);

  const acceptConnectionRequest = useCallback(async (connectionId: string) => {
    if (!user) return;

    try {
      setError(null);
      // Update connection status
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Create conversation for these users
        const { data: conversationData, error: convError } = await supabase
          .from('chat_conversations')
          .insert({})
          .select();

        if (convError) throw convError;

        const conversationId = conversationData[0].id;

        // Add participants to conversation
        await Promise.all([
          supabase
            .from('conversation_participants')
            .insert({
              conversation_id: conversationId,
              user_id: user.id
            }),
          supabase
            .from('conversation_participants')
            .insert({
              conversation_id: conversationId,
              user_id: data[0].sender_id
            })
        ]);

        toast({
          title: 'Connection accepted',
          description: 'You can now chat with this user',
        });
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      setError(error instanceof Error ? error : new Error('Failed to accept connection'));
      toast({
        title: 'Error',
        description: 'Failed to accept connection',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const declineConnectionRequest = useCallback(async (connectionId: string) => {
    if (!user) return;

    try {
      setError(null);
      // Update connection status
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'declined' })
        .eq('id', connectionId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      toast({
        title: 'Connection declined',
        description: 'Connection request has been declined',
      });
    } catch (error) {
      console.error('Error declining connection:', error);
      setError(error instanceof Error ? error : new Error('Failed to decline connection'));
      toast({
        title: 'Error',
        description: 'Failed to decline connection',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  return {
    connections,
    loadingConnections,
    acceptConnectionRequest,
    declineConnectionRequest,
    error
  };
};
