import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Trash2, UserCheck, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
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
            ),
            profiles!recipient_user_id(
              username
            )
          `)
          .eq('owner_user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedData = data.map((item) => ({
          id: item.id,
          flashcard_set_id: item.flashcard_set_id,
          recipient_user_id: item.recipient_user_id,
          permission_level: item.permission_level,
          created_at: item.created_at,
          expires_at: item.expires_at,
          set_name: item.flashcard_sets?.name || 'Unnamed Set',
          recipient_username: item.profiles?.username || 'Unknown user'
        }));

        setMyShares(formattedData);
      } catch (error) {
        console.error('Error fetching my shares:', error);
        toast.error('Failed to load your shared items');
      } finally {
        setLoading(false);
      }
    };

    fetchMyShares();
  }, [user]);

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

  const getPermissionBadge = (level: string) => {
    switch (level) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'edit':
        return <Badge variant="secondary">Edit</Badge>;
      case 'view':
      default:
        return <Badge variant="outline">View Only</Badge>;
    }
  };

  const handleViewSet = (setId: string) => {
    navigate(`/study/${setId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (myShares.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardContent className="pt-6 flex flex-col items-center">
          <UserCheck className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">You Haven't Shared Anything Yet</h3>
          <p className="text-muted-foreground">
            Share your flashcard sets with others to collaborate and study together.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resources You've Shared</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myShares.map((share) => (
          <Card key={share.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">{share.set_name}</CardTitle>
                  <CardDescription>
                    Shared with {share.recipient_username}
                  </CardDescription>
                </div>
                <Book className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getPermissionBadge(share.permission_level)}
                  <span className="text-xs text-muted-foreground">
                    Shared on {format(new Date(share.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {share.expires_at && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Expires: {format(new Date(share.expires_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => handleViewSet(share.flashcard_set_id)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                className="flex-1"
                onClick={() => setShareToDelete(share.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Revoke
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!shareToDelete} onOpenChange={(open) => !open && setShareToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke access to this flashcard set? 
              The recipient will no longer be able to access it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteShare} className="bg-destructive text-destructive-foreground">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyShares;
