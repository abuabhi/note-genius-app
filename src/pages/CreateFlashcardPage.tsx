
import { useParams, useNavigate } from "react-router-dom";
import CreateFlashcard from "@/components/flashcards/CreateFlashcard";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardProvider } from "@/contexts/flashcards/index.tsx";
import { CreateFlashcardBreadcrumb } from "@/components/flashcards/CreateFlashcardBreadcrumb";

const CreateFlashcardPage = () => {
  useRequireAuth();
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to the flashcard set page after successful creation
    navigate(`/flashcards/${setId}`);
  };


  return (
    <FlashcardProvider>
      <div className="container mx-auto p-6">
        <CreateFlashcardBreadcrumb setId={setId} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-mint-900">Add New Flashcard</h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <CreateFlashcard setId={setId} onSuccess={handleSuccess} />
        </div>
      </div>
    </FlashcardProvider>
  );
};

export default CreateFlashcardPage;
