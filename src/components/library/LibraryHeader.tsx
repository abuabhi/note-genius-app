
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserTier } from "@/hooks/useRequireAuth";
import { runDatabaseSeed } from "@/utils/databaseSeeder";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Database, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LibraryHeaderProps {
  userTier: UserTier;
}

export function LibraryHeader({ userTier }: LibraryHeaderProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedSuccess, setSeedSuccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    if (userTier !== UserTier.DEAN) {
      toast({
        title: "Access Denied",
        description: "Only DEAN tier users can seed the database",
        variant: "destructive"
      });
      return;
    }
    
    setSeeding(true);
    setSeedMessage(null);
    setSeedSuccess(null);
    
    try {
      const result = await runDatabaseSeed();
      setSeedSuccess(result.categories.success && result.sets.success);
      setSeedMessage(
        `${result.categories.message}. ${result.sets.message}`
      );
      
      toast({
        title: result.categories.success && result.sets.success ? "Success" : "Partial Success",
        description: `${result.categories.message}. ${result.sets.message}`,
        variant: result.categories.success && result.sets.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      setSeedSuccess(false);
      setSeedMessage("Failed to seed database");
      
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive"
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">Flashcard Library</h1>
      <p className="text-muted-foreground mb-4">
        Browse and search through our collection of flashcard sets
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {userTier === UserTier.DEAN && (
          <>
            <Button 
              variant="outline"
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {seeding ? "Seeding Database..." : "Seed Database"}
            </Button>
            
            <Button asChild variant="outline">
              <Link to="/admin/flashcards" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          </>
        )}
      </div>
      
      {seedMessage && (
        <Alert variant={seedSuccess ? "default" : "destructive"} className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{seedSuccess ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {seedMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
