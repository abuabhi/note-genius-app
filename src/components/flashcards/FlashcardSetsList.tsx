
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardSet } from "@/types/flashcard";
import { useNavigate } from "react-router-dom";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  AlertCircle,
  BookOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const FlashcardSetsList = () => {
  const { flashcardSets, fetchFlashcardSets, deleteFlashcardSet, loading } = useFlashcards();
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useRequireAuth();
  const [setToDelete, setSetToDelete] = useState<FlashcardSet | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSets = async () => {
      setIsLoading(true);
      try {
        await fetchFlashcardSets();
      } catch (error) {
        console.error('Error loading flashcard sets:', error);
        toast({
          title: 'Failed to load flashcard sets',
          description: 'Please try again later'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSets();
  }, [fetchFlashcardSets]);

  const handleDeleteSet = async () => {
    if (!setToDelete) return;
    
    try {
      await deleteFlashcardSet(setToDelete.id);
      toast({
        title: 'Flashcard set deleted',
        description: 'The flashcard set has been deleted successfully'
      });
      setOpenDeleteDialog(false);
      setSetToDelete(null);
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast({
        title: 'Failed to delete flashcard set',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const handleEditSet = (set: FlashcardSet) => {
    // Implementation for editing a set
    toast({
      title: 'Edit functionality',
      description: 'Edit functionality coming soon'
    });
  };
  
  const handleStudySet = (set: FlashcardSet) => {
    navigate(`/study/${set.id}`);
  };

  // Loading state
  if (isLoading || loading.sets) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // No sets state
  if (!flashcardSets || flashcardSets.length === 0) {
    return (
      <Card className="text-center p-6">
        <div className="flex flex-col items-center p-6">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No flashcard sets found</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Create your first flashcard set to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSets.map((set) => (
          <Card key={set.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg">{set.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditSet(set)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setSetToDelete(set);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">
                {set.card_count || 0} cards
              </p>
              {set.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {set.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="pb-2">
              {set.subject && (
                <div className="flex items-center">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {set.subject}
                  </span>
                  {set.topic && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-md ml-2">
                      {set.topic}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                className="w-full" 
                onClick={() => handleStudySet(set)}
                variant="default"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Study
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the flashcard set 
              "{setToDelete?.name}" and all associated cards. This 
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSet} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FlashcardSetsList;
