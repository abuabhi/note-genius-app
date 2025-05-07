
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isCollaborationEnabled } from "@/utils/premiumFeatures";
import { BookOpen, Users, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";
import { Separator } from "@/components/ui/separator";
import { ExportImportFlashcards } from "../flashcards/ExportImportFlashcards";
import { ShareFlashcardSet } from "./ShareFlashcardSet";

const CollaborationHub = () => {
  const { userProfile } = useRequireAuth();
  const { flashcardSets, fetchFlashcardSets } = useFlashcards();
  const [sharedSets, setSharedSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isCollaborationFeatureEnabled = isCollaborationEnabled(userProfile?.user_tier);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchFlashcardSets();
        
        // In a real app, we'd fetch shared sets from the backend
        // For now, we'll simulate it with a subset of the user's sets
        if (flashcardSets.length > 0) {
          // Use the first few sets as "shared" for demo purposes
          setSharedSets(flashcardSets.slice(0, 2).map(set => ({
            ...set,
            shared_by: "Jane Smith", // This would come from the real shared data
            shared_at: new Date().toISOString(),
          } as FlashcardSet & { shared_by: string, shared_at: string })));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error Loading Data",
          description: "There was a problem fetching your collaboration data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchFlashcardSets, toast]);
  
  if (!isCollaborationFeatureEnabled) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Dean Tier Feature</h2>
          <p className="text-muted-foreground">
            Collaboration features are only available for Dean tier users.
            Upgrade your subscription to unlock shared flashcard sets,
            real-time collaboration, and more.
          </p>
          <Button onClick={() => navigate("/pricing")}>
            View Pricing
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Hub</h2>
          <p className="text-muted-foreground">
            Share your flashcard sets with others and study together.
          </p>
        </div>
        <ExportImportFlashcards />
      </div>
      
      <Separator />
      
      <Tabs defaultValue="shared-with-me" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
          <TabsTrigger value="my-shared">My Shared Sets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shared-with-me" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : sharedSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedSets.map((set) => (
                <Card key={set.id}>
                  <CardHeader>
                    <CardTitle>{set.name}</CardTitle>
                    <CardDescription>
                      Shared by: {(set as any).shared_by || "A colleague"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {set.description && <p className="text-sm">{set.description}</p>}
                    <div className="mt-2 flex items-center">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {set.card_count || 0} cards
                      </span>
                      {set.subject && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-md ml-2">
                          {set.subject}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/study/${set.id}`)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Study
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "The ability to clone shared sets will be available soon.",
                        });
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Clone to My Sets
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <h3 className="font-semibold">No Shared Sets</h3>
                  <p className="text-muted-foreground">
                    No one has shared any flashcard sets with you yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="my-shared" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.slice(0, 3).map((set) => (
              <Card key={set.id}>
                <CardHeader>
                  <CardTitle>{set.name}</CardTitle>
                  <CardDescription>
                    {set.card_count || 0} cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {set.description && <p className="text-sm">{set.description}</p>}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <ShareFlashcardSet set={set} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationHub;
