
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import { SharedItem, SharedItemCard } from "./components/SharedItemCard";

const SharedWithMe = () => {
  const { user } = useAuth();
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedItems = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all items shared with this user
        const { data, error } = await supabase
          .from('shared_flashcard_sets')
          .select(`
            id,
            flashcard_set_id,
            owner_user_id,
            permission_level,
            created_at,
            expires_at,
            flashcard_sets(
              name,
              description
            )
          `)
          .eq('recipient_user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch owner usernames in a separate query since we can't directly join
        const ownerIds = data.map(item => item.owner_user_id);
        const { data: ownerProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', ownerIds);
        
        if (profileError) throw profileError;

        // Create a map of owner IDs to usernames
        const ownerMap = new Map();
        if (ownerProfiles) {
          ownerProfiles.forEach(profile => {
            ownerMap.set(profile.id, profile.username);
          });
        }

        const formattedData = data.map((item) => ({
          id: item.id,
          flashcard_set_id: item.flashcard_set_id,
          owner_user_id: item.owner_user_id,
          permission_level: item.permission_level,
          created_at: item.created_at,
          expires_at: item.expires_at,
          set_name: item.flashcard_sets?.name || 'Unnamed Set',
          set_description: item.flashcard_sets?.description,
          owner_username: ownerMap.get(item.owner_user_id) || 'Unknown user'
        }));

        setSharedItems(formattedData);
      } catch (error) {
        console.error('Error fetching shared items:', error);
        toast.error('Failed to load shared items');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItems();
  }, [user]);

  function handleViewSet(setId: string) {
    navigate(`/study/${setId}`);
  }

  if (loading) {
    return <LoadingState />;
  }

  if (sharedItems.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resources Shared With Me</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedItems.map((item) => (
          <SharedItemCard 
            key={item.id}
            item={item}
            onViewSet={handleViewSet}
          />
        ))}
      </div>
    </div>
  );
};

export default SharedWithMe;
