
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useSimpleFlashcardSets } from "@/hooks/useSimpleFlashcardSets";

const SimpleFlashcardSetsList = () => {
  const { flashcardSets, loading, error, deleteFlashcardSet } = useSimpleFlashcardSets();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const handleDeleteSet = async (setId: string) => {
    setIsDeleting(setId);
    try {
      await deleteFlashcardSet(setId);
    } catch (error) {
      console.error('Error deleting set:', error);
    } finally {
      setIsDeleting(null);
    }
  };
  
  if (loading) {
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  if (!flashcardSets || flashcardSets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You don't have any flashcard sets yet.</p>
        <Button asChild>
          <Link to="/flashcards/create">Create Your First Set</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcardSets.map((set) => (
        <Card key={set.id}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{set.name}</h3>
            <p className="text-sm text-muted-foreground">
              {set.card_count || 0} cards
              {set.subject && ` • ${set.subject}`}
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

export default SimpleFlashcardSetsList;
