
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  BookOpen, 
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FlashcardSet } from "@/types/flashcard";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  progressPercentage: number;
  isDeleting: boolean;
  onDelete: (setId: string) => void;
}

const FlashcardSetCard = ({
  set,
  progressPercentage,
  isDeleting,
  onDelete,
}: FlashcardSetCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-mint-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-mint-900 line-clamp-2 mb-2">
              {set.name}
            </CardTitle>
            {set.subject && (
              <Badge variant="secondary" className="mb-2 bg-mint-100 text-mint-700">
                {set.subject}
              </Badge>
            )}
            {set.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {set.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/flashcards/${set.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Set
                </Link>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Set
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Flashcard Set</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{set.name}"? This action cannot be undone and will remove all flashcards in this set.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(set.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BookOpen className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Cards</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {set.card_count || 0}
              </div>
            </div>
            
            <div className="bg-mint-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-mint-600" />
                <span className="text-sm font-medium text-mint-700">Progress</span>
              </div>
              <div className="text-xl font-bold text-mint-900">
                {progressPercentage}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button asChild className="flex-1" size="sm">
              <Link to={`/study/${set.id}`}>
                <Play className="h-4 w-4 mr-2" />
                Study
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link to={`/flashcards/${set.id}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Updated {new Date(set.updated_at || set.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardSetCard;
