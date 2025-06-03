
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    const loadFlashcardSets = async () => {
      try {
        console.log('FlashcardSetsList: Starting to fetch flashcard sets...');
        await fetchFlashcardSets();
        console.log('FlashcardSetsList: Fetch completed');
      } catch (error) {
        console.error('FlashcardSetsList: Error fetching sets:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadFlashcardSets();
  }, [fetchFlashcardSets]);
  
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
  
  // Show loading state only during initial load
  if (isInitialLoading || loading?.sets) {
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
  
  console.log('FlashcardSetsList: Current flashcardSets:', flashcardSets);
  
  // Show empty state only after loading is complete and no sets exist
  if (!flashcardSets || flashcardSets.length === 0) {
    console.log('FlashcardSetsList: No flashcard sets found, showing empty state');
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You don't have any flashcard sets yet.</p>
        <Button>Create Your First Set</Button>
      </div>
    );
  }
  
  console.log('FlashcardSetsList: Rendering flashcard sets:', flashcardSets.length);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcardSets.map((set: FlashcardSet) => (
        <Card key={set.id}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{set.name}</h3>
            <p className="text-sm text-muted-foreground">
              {set.card_count || 0} cards
              {set.subject_categories?.name && ` • ${set.subject_categories.name}`}
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
