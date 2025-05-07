
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import ShareCard from "./components/ShareCard";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";

interface MyShare {
  id: string;
  flashcard_set_id: string;
  recipient_user_id: string;
  permission_level: string;
  created_at: string;
  expires_at: string | null;
  set_name: string;
  recipient_username: string | null;
}

const MyShares = () => {
  const { user } = useAuth();
  const [myShares, setMyShares] = useState<MyShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareToDelete, setShareToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMyShares();
  }, [user]);

  const fetchMyShares = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all items this user has shared with others
      const { data, error } = await supabase
        .from('shared_flashcard_sets')
        .select(`
          id,
          flashcard_set_id,
          recipient_user_id,
          permission_level,
          created_at,
          expires_at,
          flashcard_sets(
            name
          )
        `)
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch recipient usernames in a separate query
      const recipientIds = data.map(item => item.recipient_user_id);
      const { data: recipientProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', recipientIds);
      
      if (profileError) throw profileError;

      // Create a map of recipient IDs to usernames
      const recipientMap = new Map();
      if (recipientProfiles) {
        recipientProfiles.forEach(profile => {
          recipientMap.set(profile.id, profile.username);
        });
      }

      const formattedData = data.map((item) => ({
        id: item.id,
        flashcard_set_id: item.flashcard_set_id,
        recipient_user_id: item.recipient_user_id,
        permission_level: item.permission_level,
        created_at: item.created_at,
        expires_at: item.expires_at,
        set_name: item.flashcard_sets?.name || 'Unnamed Set',
        recipient_username: recipientMap.get(item.recipient_user_id) || 'Unknown user'
      }));

      setMyShares(formattedData);
    } catch (error) {
      console.error('Error fetching my shares:', error);
      toast.error('Failed to load your shared items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShare = async () => {
    if (!shareToDelete) return;
    
    try {
      const { error } = await supabase
        .from('shared_flashcard_sets')
        .delete()
        .eq('id', shareToDelete);
      
      if (error) throw error;
      
      setMyShares(prev => prev.filter(share => share.id !== shareToDelete));
      toast.success('Sharing permission revoked successfully');
    } catch (error) {
      console.error('Error deleting share:', error);
      toast.error('Failed to revoke sharing permission');
    } finally {
      setShareToDelete(null);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (myShares.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resources You've Shared</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myShares.map((share) => (
          <ShareCard
            key={share.id}
            id={share.id}
            flashcardSetId={share.flashcard_set_id}
            setName={share.set_name}
            recipientUsername={share.recipient_username || ''}
            permissionLevel={share.permission_level}
            createdAt={share.created_at}
            expiresAt={share.expires_at}
            onDelete={setShareToDelete}
          />
        ))}
      </div>

      <DeleteConfirmationDialog
        isOpen={!!shareToDelete}
        onClose={() => setShareToDelete(null)}
        onConfirm={handleDeleteShare}
      />
    </div>
  );
};

export default MyShares;
