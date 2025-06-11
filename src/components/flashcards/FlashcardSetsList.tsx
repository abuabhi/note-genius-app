
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { FlashcardSet } from "@/types/flashcard";

const FlashcardSetsList = () => {
  const { flashcardSets, loading, fetchFlashcardSets, deleteFlashcardSet } = useFlashcards();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    if (!hasLoaded) {
      console.log('FlashcardSetsList: Loading flashcard sets...');
      fetchFlashcardSets()
        .then(() => {
          console.log('FlashcardSetsList: Successfully loaded sets');
          setHasLoaded(true);
        })
        .catch((error) => {
          console.error('FlashcardSetsList: Failed to load sets:', error);
          setHasLoaded(true); // Still mark as loaded to prevent infinite loop
        });
    }
  }, [fetchFlashcardSets, hasLoaded]);
  
  const handleDeleteSet = async (setId: string) => {
    setIsDeleting(setId);
    try {
      await deleteFlashcardSet(setId);
      console.log('Set deleted successfully:', setId);
    } catch (error) {
      console.error('Error deleting set:', error);
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Show loading only when we haven't loaded yet or explicit loading state
  if (!hasLoaded || loading?.sets) {
    console.log('FlashcardSetsList: Showing loading state');
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
  
  // Show empty state if no sets are available
  if (!flashcardSets || flashcardSets.length === 0) {
    console.log('FlashcardSetsList: Showing empty state');
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You don't have any flashcard sets yet.</p>
        <Button asChild>
          <Link to="/flashcards/create">Create Your First Set</Link>
        </Button>
      </div>
    );
  }
  
  console.log('FlashcardSetsList: Rendering', flashcardSets.length, 'flashcard sets');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcardSets.map((set: FlashcardSet) => (
        <Card key={set.id}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{set.name}</h3>
            <p className="text-sm text-muted-foreground">
              {set.card_count || 0} cards
              {set.academic_subjects?.name && ` • ${set.academic_subjects.name}`}
            </p>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm">
              {set.description || "No description provided"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <Link to={`/study/${set.id}`}>Study</Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDeleteSet(set.id)} 
                disabled={isDeleting === set.id}
              >
                {isDeleting === set.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
            <Button asChild>
              <Link to={`/flashcards/${set.id}`}>Edit</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FlashcardSetsList;
