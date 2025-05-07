
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
  const { fetchFlashcardsInSet, currentSet, setCurrentSet, fetchFlashcardSets } = useFlashcards();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFlashcardSet = async () => {
      setIsLoading(true);
      try {
        // Load sets first
        const sets = await fetchFlashcardSets();
        
        // Then find the current set if we have a setId
        if (setId && sets && sets.length > 0) {
          const foundSet = sets.find(s => s.id === setId);
          if (foundSet) {
            setCurrentSet(foundSet);
          }
        }
      } catch (error) {
        console.error("Error loading flashcard set:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFlashcardSet();
    
    // Cleanup
    return () => {
      setCurrentSet(null);
    };
  }, [setId, fetchFlashcardSets, setCurrentSet]);
  
  if (!setId) {
    return <Navigate to="/flashcards" />;
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
        
        <StudyModeSelector mode={mode} setMode={setMode} />
      </div>
      
      <Separator className="mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <FlashcardStudy setId={setId} mode={mode} />
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
