
import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSimpleFlashcardSets } from "@/hooks/useSimpleFlashcardSets";
import { SimplifiedStudyModeSelector } from "@/components/study/SimplifiedStudyModeSelector";
import { StudyModeInfo } from "@/components/study/StudyModeInfo";
import { Separator } from "@/components/ui/separator";
import { StudyMode } from "./types";
import { StudyPageHeader } from "./StudyPageHeader";
import { SimplifiedStudyPageLayout } from "./SimplifiedStudyPageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, BookOpen } from "lucide-react";

export const StudyPageContent = () => {
  const { setId } = useParams<{ setId: string }>();
  const [mode, setMode] = useState<StudyMode>("learn");
  const { flashcardSets, loading, fetchFlashcardSets } = useSimpleFlashcardSets();
  const [currentSet, setCurrentSet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  const loadFlashcardSet = useCallback(async () => {
    if (!setId || hasAttemptedLoad) return;
    
    console.log("Starting loadFlashcardSet for setId:", setId);
    setIsLoading(true);
    setError(null);
    setHasAttemptedLoad(true);
    
    try {
      // First check if we already have the set in our existing sets
      let targetSet = flashcardSets?.find(s => s.id === setId);
      
      if (!targetSet) {
        console.log("Set not found in existing sets, fetching all sets...");
        const sets = await fetchFlashcardSets();
        targetSet = sets?.find(s => s.id === setId);
      }
      
      console.log("Target set found:", targetSet);
      
      if (targetSet) {
        setCurrentSet(targetSet);
        setError(null);
      } else {
        setError("Flashcard set not found");
      }
    } catch (fetchError) {
      console.error("Error in loadFlashcardSet:", fetchError);
      setError("Failed to load flashcard set. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [setId, hasAttemptedLoad, flashcardSets, fetchFlashcardSets]);
  
  useEffect(() => {
    console.log("StudyPageContent useEffect triggered", { setId, hasAttemptedLoad });
    if (setId && !hasAttemptedLoad) {
      loadFlashcardSet();
    }
  }, [setId, loadFlashcardSet, hasAttemptedLoad]);
  
  if (!setId) {
    return <Navigate to="/flashcards" />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setHasAttemptedLoad(false);
                setError(null);
                loadFlashcardSet();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/flashcards" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Flashcards
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isLoading ? "Loading..." : currentSet?.name || "Study Session"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isLoading ? "Loading..." : currentSet?.name || "Study Session"}
            </h1>
            {currentSet?.description && (
              <p className="text-muted-foreground mt-1">{currentSet.description}</p>
            )}
          </div>
          
          {/* Study mode selector */}
          {!isLoading && (
            <SimplifiedStudyModeSelector 
              currentMode={mode}
              onModeChange={setMode}
            />
          )}
        </div>
        
        {/* Study mode info */}
        {!isLoading && <StudyModeInfo currentMode={mode} />}
      </div>
      
      <Separator className="mb-6" />
      
      <SimplifiedStudyPageLayout
        isLoading={isLoading}
        setId={setId}
        mode={mode}
        currentSet={currentSet}
      />
    </div>
  );
};
