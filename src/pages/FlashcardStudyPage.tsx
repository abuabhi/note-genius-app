
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { StudyPageContent } from "@/pages/study/StudyPageContent";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardProvider, useFlashcards } from "@/contexts/FlashcardContext";

const FlashcardStudyPageContent = () => {
  const { setId, id } = useParams();
  const navigate = useNavigate();
  const { flashcardSets, fetchFlashcardSets, loading } = useFlashcards();
  useRequireAuth();

  // Use either setId or id parameter
  const currentSetId = setId || id;
  const [currentSet, setCurrentSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSet = async () => {
      if (!currentSetId) {
        setError("No set ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First check if we already have the set in our existing sets
        let targetSet = flashcardSets.find(set => set.id === currentSetId);
        
        if (!targetSet) {
          console.log("Set not found in existing sets, fetching all sets...");
          await fetchFlashcardSets();
          // Check again after fetching
          targetSet = flashcardSets.find(set => set.id === currentSetId);
        }
        
        console.log("Target set found:", targetSet);
        
        if (targetSet) {
          setCurrentSet(targetSet);
          setError(null);
        } else {
          setError("Flashcard set not found");
        }
      } catch (fetchError) {
        console.error("Error loading flashcard set:", fetchError);
        setError("Failed to load flashcard set. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSet();
  }, [currentSetId, flashcardSets, fetchFlashcardSets]);

  const handleGoBack = () => {
    navigate('/flashcards');
  };

  if (isLoading || loading.sets) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
            <p className="mt-2 text-muted-foreground">Loading flashcard set...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !currentSet || !currentSetId) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              {error || "Flashcard Set Not Found"}
            </h2>
            <p className="mb-4 text-red-600">
              {error || "The flashcard set you're looking for doesn't exist or has been deleted."}
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flashcards
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Use StudyPageContent which has breadcrumb and mode selector */}
      <StudyPageContent />
    </Layout>
  );
};

const FlashcardStudyPage = () => {
  return (
    <FlashcardProvider>
      <FlashcardStudyPageContent />
    </FlashcardProvider>
  );
};

export default FlashcardStudyPage;
