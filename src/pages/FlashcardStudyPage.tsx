
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useOptimizedFlashcardSets } from "@/hooks/useOptimizedFlashcardSets";
import { Button } from "@/components/ui/button";
import { StudyPageContent } from "@/pages/study/StudyPageContent";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CompactFloatingTimer } from "@/components/study/CompactFloatingTimer";

const FlashcardStudyPage = () => {
  const { setId, id } = useParams();
  const navigate = useNavigate();
  const { allSets: flashcardSets, loading } = useOptimizedFlashcardSets();
  const [studyStarted, setStudyStarted] = useState(false);
  useRequireAuth();

  // Use either setId or id parameter
  const currentSetId = setId || id;
  const currentSet = flashcardSets.find(set => set.id === currentSetId);

  const handleGoBack = () => {
    navigate('/flashcards');
  };

  // Auto-start study activity when component mounts
  useEffect(() => {
    if (currentSet && !loading) {
      setStudyStarted(true);
    }
  }, [currentSet, loading]);

  if (loading) {
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

  if (!currentSet || !currentSetId) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Flashcard Set Not Found</h2>
            <p className="mb-4 text-red-600">
              The flashcard set you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={handleGoBack}>
              Back to Flashcards
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Compact Floating Timer - shows during study */}
      {studyStarted && (
        <CompactFloatingTimer
          activityType="flashcard"
          isActive={true}
          className="bg-mint-500 border-mint-600"
        />
      )}

      {/* Use StudyPageContent which has breadcrumb and mode selector */}
      <StudyPageContent />
    </Layout>
  );
};

export default FlashcardStudyPage;
