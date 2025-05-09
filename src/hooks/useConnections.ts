
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UserConnection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender_profile?: UserProfile;
  receiver_profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

export const useConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for incoming connection requests
  const { data: incomingRequests = [], isLoading: incomingLoading } = useQuery({
    queryKey: ["connectionRequests", "incoming", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          sender_profile:sender_id(id, username, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
        
      if (error) {
        console.error('Error fetching incoming connection requests:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user
  });
  
  // Query for outgoing connection requests
  const { data: outgoingRequests = [], isLoading: outgoingLoading } = useQuery({
    queryKey: ["connectionRequests", "outgoing", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          receiver_profile:receiver_id(id, username, avatar_url)
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending');
        
      if (error) {
        console.error('Error fetching outgoing connection requests:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user
  });
  
  // Query for accepted connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch connections where the user is either sender or receiver
      const { data: sentConnections, error: sentError } = await supabase
        .from('user_connections')
        .select(`
          *,
          receiver_profile:receiver_id(id, username, avatar_url)
        `)
        .eq('sender_id', user.id)
        .eq('status', 'accepted');
        
      if (sentError) {
        console.error('Error fetching sent connections:', sentError);
        throw sentError;
      }
      
      const { data: receivedConnections, error: receivedError } = await supabase
        .from('user_connections')
        .select(`
          *,
          sender_profile:sender_id(id, username, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'accepted');
        
      if (receivedError) {
        console.error('Error fetching received connections:', receivedError);
        throw receivedError;
      }
      
      // Merge the two sets of connections
      return [...(sentConnections || []), ...(receivedConnections || [])];
    },
    enabled: !!user
  });
  
  // Mutation to send a connection request
  const sendRequest = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      if (receiverId === user.id) {
        throw new Error('Cannot send connection request to yourself');
      }
      
      // Check if a connection already exists
      const { data: existingConnection, error: checkError } = await supabase
        .from('user_connections')
        .select('id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`);
        
      if (checkError) {
        console.error('Error checking existing connection:', checkError);
        throw checkError;
      }
      
      if (existingConnection && existingConnection.length > 0) {
        const connection = existingConnection[0];
        if (connection.status === 'pending') {
          throw new Error('Connection request already pending');
        } else if (connection.status === 'accepted') {
          throw new Error('Already connected');
        }
      }
      
      // Create the connection request
      const { data, error } = await supabase
        .from('user_connections')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        })
        .select();
        
      if (error) {
        console.error('Error sending connection request:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Connection request sent');
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send connection request');
    }
  });
  
  // Mutation to respond to a connection request
  const respondToRequest = useMutation({
    mutationFn: async ({ connectionId, accept }: { connectionId: string; accept: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_connections')
        .update({
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .eq('receiver_id', user.id) // Ensure only the receiver can update
        .select();
        
      if (error) {
        console.error('Error responding to connection request:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.accept ? 'Connection accepted' : 'Connection declined');
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: () => {
      toast.error('Failed to update connection request');
    }
  });
  
  // Search users for connection
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    if (!user) return [];
    
    // Search for users by username
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${searchTerm}%`)
      .neq('id', user.id) // Exclude current user
      .limit(10);
      
    if (error) {
      console.error('Error searching users:', error);
      return [];
    }
    
    return data || [];
  };
  
  const isLoading = incomingLoading || outgoingLoading || connectionsLoading;
  
  return {
    incomingRequests,
    outgoingRequests,
    connections,
    isLoading,
    sendRequest,
    respondToRequest,
    searchUsers
  };
};
