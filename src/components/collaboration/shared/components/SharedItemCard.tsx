
import { Book, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SharedItem {
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

interface SharedItemCardProps {
  item: SharedItem;
  onViewSet: (setId: string) => void;
}

export function SharedItemCard({ item, onViewSet }: SharedItemCardProps) {
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
  
  return (
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
          onClick={() => onViewSet(item.flashcard_set_id)} 
          className="w-full"
        >
          View Set
        </Button>
      </CardFooter>
    </Card>
  );
}
