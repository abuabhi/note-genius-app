
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SimplifiedStudyPage } from "@/pages/study/SimplifiedStudyPage";
import { ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardProvider } from "@/contexts/FlashcardContext";

const FlashcardStudyPageContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useRequireAuth();

  console.log("FlashcardStudyPage: Params received", { id });
  console.log("FlashcardStudyPage: Current URL:", window.location.pathname);

  // Use the standardized :id parameter consistently
  const currentSetId = id;

  if (!currentSetId) {
    console.error("FlashcardStudyPage: No set ID provided in params", { id });
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            No Set ID Provided
          </h2>
          <p className="mb-4 text-red-600">
            Unable to load study session - no flashcard set ID was provided.
          </p>
          <p className="mb-4 text-sm text-gray-600">Current URL: {window.location.pathname}</p>
          <Button onClick={() => navigate("/flashcards")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Button>
        </div>
      </div>
    );
  }

  console.log("FlashcardStudyPage: Rendering SimplifiedStudyPage with setId:", currentSetId);

  return <SimplifiedStudyPage />;
};

const FlashcardStudyPage = () => {
  return (
    <FlashcardProvider>
      <FlashcardStudyPageContent />
    </FlashcardProvider>
  );
};

export default FlashcardStudyPage;
