
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CreateFlashcard from "@/components/flashcards/CreateFlashcard";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FlashcardProvider } from "@/contexts/flashcards/index.tsx";

const CreateFlashcardPage = () => {
  useRequireAuth();
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to the flashcard set page after successful creation
    navigate(`/flashcards/${setId}`);
  };

  const handleBack = () => {
    navigate(`/flashcards/${setId}`);
  };

  return (
    <Layout>
      <FlashcardProvider>
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Set
            </Button>
            <h1 className="text-3xl font-bold text-mint-900">Add New Flashcard</h1>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <CreateFlashcard setId={setId} onSuccess={handleSuccess} />
          </div>
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default CreateFlashcardPage;
