
import { useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const FlashcardSetsList = () => {
  const { flashcardSets, fetchFlashcardSets, loading } = useFlashcards();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadSets = async () => {
      try {
        await fetchFlashcardSets();
      } catch (error) {
        console.error('Error loading flashcard sets:', error);
        toast({
          title: 'Failed to load flashcard sets',
          description: 'Please try again later',
          variant: 'destructive'
        });
      }
    };
    
    loadSets();
  }, [fetchFlashcardSets, toast]);
  
  // Loading state
  if (loading.sets) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // No sets state
  if (flashcardSets.length === 0) {
    return (
      <Card className="w-full flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No flashcard sets found</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          Create your first flashcard set to start organizing your flashcards.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcardSets.map((set) => (
        <Card key={set.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>{set.name}</CardTitle>
            {set.subject && (
              <CardDescription>
                {set.subject} {set.topic ? `• ${set.topic}` : ''}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {set.description || "No description provided"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <Book className="h-3 w-3" />
              <span>{set.card_count} cards</span>
            </Badge>
            <Button size="sm">Study</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FlashcardSetsList;
