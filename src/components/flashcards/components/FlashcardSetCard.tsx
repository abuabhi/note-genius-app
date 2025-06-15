
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BookOpen, Play, Trash2, Users, Clock, Target, Pin, PinOff, Star } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import { formatDistanceToNow } from "date-fns";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  progressPercentage?: number;
  isDeleting?: boolean;
  onDelete?: (setId: string) => void;
  onTogglePinned?: (setId: string, isPinned: boolean) => void;
  masteredCards?: number;
  needsPracticeCards?: number;
  totalCards?: number;
}

const FlashcardSetCard = ({
  set,
  progressPercentage = 0,
  isDeleting = false,
  onDelete,
  onTogglePinned,
  masteredCards = 0,
  needsPracticeCards = 0,
  totalCards = 0
}: FlashcardSetCardProps) => {
  const [isPinned, setIsPinned] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(set.id);
    }
  };

  const handleTogglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (onTogglePinned) {
      onTogglePinned(set.id, newPinnedState);
    }
  };

  const handleStudyClick = () => {
    console.log('FlashcardSetCard: Study button clicked for set:', set.id);
  };

  const cardCount = set.card_count || totalCards || 0;
  const displayProgressPercentage = masteredCards > 0 && totalCards > 0 
    ? Math.round((masteredCards / totalCards) * 100) 
    : progressPercentage;

  return (
    <Card className="group relative hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-mint-300">
      {/* Pin Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTogglePin}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
      >
        {isPinned ? (
          <Pin className="h-4 w-4 text-mint-600" />
        ) : (
          <PinOff className="h-4 w-4 text-gray-400" />
        )}
      </Button>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-8">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {set.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{cardCount} cards</span>
              {set.subject && (
                <>
                  <span>•</span>
                  <span className="text-mint-600 font-medium">{set.subject}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {set.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {set.description}
          </p>
        )}

        {/* Progress Section */}
        {cardCount > 0 && displayProgressPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-mint-700">{displayProgressPercentage}%</span>
            </div>
            <Progress value={displayProgressPercentage} className="h-2" />
            
            {masteredCards > 0 && totalCards > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-green-500" />
                  {masteredCards} mastered
                </span>
                {needsPracticeCards > 0 && (
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-orange-500" />
                    {needsPracticeCards} to practice
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Updated timestamp */}
        {set.updated_at && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDistanceToNow(new Date(set.updated_at), { addSuffix: true })}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        {/* Primary Study Button - Most Prominent */}
        <Button 
          asChild 
          className="flex-1 bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleStudyClick}
        >
          <Link to={`/flashcards/sets/${set.id}`}>
            <Play className="h-4 w-4 mr-2" />
            Study Now
          </Link>
        </Button>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default FlashcardSetCard;
