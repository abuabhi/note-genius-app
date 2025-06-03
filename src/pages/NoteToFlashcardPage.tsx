
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useNotes } from "@/contexts/NoteContext";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { BulkNoteConversion } from "@/components/notes/conversion/BulkNoteConversion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Book, ArrowRight } from "lucide-react";
import { FlashcardSet } from "@/types/flashcard";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const NoteToFlashcardPage = () => {
  const { filteredNotes } = useNotes();
  const [convertedSet, setConvertedSet] = useState<FlashcardSet | null>(null);
  const navigate = useNavigate();
  useRequireAuth();

  const handleConversionSuccess = (flashcardSet: FlashcardSet) => {
    setConvertedSet(flashcardSet);
  };

  const handleViewSet = () => {
    navigate(`/flashcards?set=${convertedSet?.id}`);
  };

  const handleGoBack = () => {
    navigate("/notes");
  };

  return (
    <Layout>
      <FlashcardProvider>
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5" />
            <ArrowRight className="h-4 w-4" />
            <Book className="h-5 w-5" />
            <h1 className="text-2xl font-semibold">Note to Flashcard Conversion</h1>
          </div>

          {convertedSet ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
              <h2 className="text-xl font-semibold text-green-700 mb-2">Conversion Complete!</h2>
              <p className="mb-4 text-green-600">
                Successfully created flashcard set: <strong>{convertedSet.name}</strong> with{" "}
                <strong>{convertedSet.card_count || 0}</strong> flashcards.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={handleViewSet}>
                  View Flashcard Set
                </Button>
                <Button variant="outline" onClick={() => setConvertedSet(null)}>
                  Convert More Notes
                </Button>
              </div>
            </div>
          ) : (
            <>
              {filteredNotes.length > 0 ? (
                <BulkNoteConversion
                  notes={filteredNotes}
                  onSuccess={handleConversionSuccess}
                  onCancel={handleGoBack}
                />
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <p className="text-lg text-gray-600 mb-4">No notes available for conversion.</p>
                  <Button onClick={handleGoBack}>
                    Back to Notes
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default NoteToFlashcardPage;
