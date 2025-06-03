
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useParams, Navigate } from "react-router-dom";
import { FlashcardProvider, useFlashcards } from "@/contexts/FlashcardContext";
import { StudyModeSelector } from "@/components/study/StudyModeSelector";
import { FlashcardStudy } from "@/components/study/FlashcardStudy";
import { StudyProgress } from "@/components/study/StudyProgress";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";

export type StudyMode = "learn" | "review" | "test";

const StudyPageContent = () => {
  const { setId } = useParams<{ setId: string }>();
  const [mode, setMode] = useState<StudyMode>("learn");
  const { fetchFlashcardSets, currentSet, setCurrentSet, flashcardSets } = useFlashcards();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadFlashcardSet = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Loading flashcard set with ID:", setId);
        
        // First fetch all sets if not already loaded
        let sets = flashcardSets;
        if (!sets || sets.length === 0) {
          console.log("Fetching flashcard sets...");
          sets = await fetchFlashcardSets();
        }
        
        // Find the specific set
        const foundSet = sets.find(s => s.id === setId);
        console.log("Found set:", foundSet);
        
        if (foundSet) {
          setCurrentSet(foundSet);
        } else {
          setError("Flashcard set not found");
        }
      } catch (error) {
        console.error("Error loading flashcard set:", error);
        setError("Failed to load flashcard set");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFlashcardSet();
  }, [setId, fetchFlashcardSets, setCurrentSet, flashcardSets]);
  
  if (!setId) {
    return <Navigate to="/flashcards" />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isLoading ? "Loading..." : currentSet?.name || "Study Session"}
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? "" : currentSet?.description || "Practice and review your flashcards"}
          </p>
        </div>
        
        {!isLoading && <StudyModeSelector mode={mode} setMode={setMode} />}
      </div>
      
      <Separator className="mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading flashcards...</p>
              </div>
            </div>
          ) : (
            <FlashcardStudy setId={setId} mode={mode} />
          )}
        </div>
        
        <div className="md:col-span-1">
          <StudyProgress />
        </div>
      </div>
    </div>
  );
};

const StudyPage = () => {
  useRequireAuth();
  
  return (
    <Layout>
      <FlashcardProvider>
        <StudyPageContent />
      </FlashcardProvider>
    </Layout>
  );
};

export default StudyPage;
