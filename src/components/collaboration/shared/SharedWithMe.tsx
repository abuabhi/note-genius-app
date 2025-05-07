
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, FileText, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SharedItem {
  id: string;
  flashcard_set_id: string;
  owner_user_id: string;
  permission_level: string;
  created_at: string;
  expires_at: string | null;
  set_name: string;
  set_description: string | null;
  owner_username: string | null;
}

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

  function getPermissionBadge(level: string) {
    switch (level) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'edit':
        return <Badge variant="secondary">Edit</Badge>;
      case 'view':
      default:
        return <Badge variant="outline">View Only</Badge>;
    }
  }

  function handleViewSet(setId: string) {
    navigate(`/study/${setId}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (sharedItems.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardContent className="pt-6 flex flex-col items-center">
          <Share2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Shared Resources Yet</h3>
          <p className="text-muted-foreground">
            When someone shares a flashcard set with you, it will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resources Shared With Me</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">{item.set_name}</CardTitle>
                  <CardDescription>
                    Shared by {item.owner_username}
                  </CardDescription>
                </div>
                <Book className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.set_description || 'No description provided.'}
                </p>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Flashcard Set</span>
                  {getPermissionBadge(item.permission_level)}
                </div>
                {item.expires_at && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Expires: {format(new Date(item.expires_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleViewSet(item.flashcard_set_id)} 
                className="w-full"
              >
                View Set
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SharedWithMe;
