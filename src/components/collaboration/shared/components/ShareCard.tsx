
import { format } from "date-fns";
import { Book, Clock, ExternalLink, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ShareCardProps {
  id: string;
  flashcardSetId: string;
  setName: string;
  recipientUsername: string;
  permissionLevel: string;
  createdAt: string;
  expiresAt: string | null;
  onDelete: (id: string) => void;
}

const ShareCard = ({
  id,
  flashcardSetId,
  setName,
  recipientUsername,
  permissionLevel,
  createdAt,
  expiresAt,
  onDelete,
}: ShareCardProps) => {
  const navigate = useNavigate();

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

  const handleViewSet = () => {
    navigate(`/study/${flashcardSetId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1">{setName}</CardTitle>
            <CardDescription>
              Shared with {recipientUsername}
            </CardDescription>
          </div>
          <Book className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {getPermissionBadge(permissionLevel)}
            <span className="text-xs text-muted-foreground">
              Shared on {format(new Date(createdAt), 'MMM d, yyyy')}
            </span>
          </div>
          {expiresAt && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Expires: {format(new Date(expiresAt), 'MMM d, yyyy')}
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
          onClick={handleViewSet}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          className="flex-1"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Revoke
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShareCard;
