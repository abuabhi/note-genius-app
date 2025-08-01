import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NoteStudyView } from "@/components/notes/study/NoteStudyView";
import { NoteChatToggle } from "@/components/notes/study/chat/NoteChatToggle";
import { NoteChatSidebar } from "@/components/notes/study/chat/NoteChatSidebar";
import { StudyBreadcrumb } from "@/components/notes/study/navigation/StudyBreadcrumb";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedNoteStudy } from "@/hooks/notes/useOptimizedNoteStudy";
import { OptimizedNotesProvider } from "@/contexts/OptimizedNotesContext";
import { FlashcardProvider } from "@/contexts/FlashcardContext";

const NoteStudyPageContent = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Require authentication
  useRequireAuth();

  // Redirect invalid "convert" route to proper flashcard conversion page
  useEffect(() => {
    if (noteId === 'convert') {
      navigate('/note-to-flashcard', { replace: true });
      return;
    }
  }, [noteId, navigate]);

  // Use optimized data fetching
  const { note, isLoading, error } = useOptimizedNoteStudy(noteId || '');

  // Debug logging
  useEffect(() => {
    console.log("🔍 NoteStudyPage Optimized - Note ID:", noteId);
    console.log("📊 Loading state:", isLoading);
    console.log("📝 Note loaded:", !!note);
  }, [noteId, isLoading, note]);

  const handleGoBack = () => {
    navigate('/notes');
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
          <p className="mt-2 text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            {error ? 'Error Loading Note' : 'Note Not Found'}
          </h2>
          <p className="mb-4 text-red-600">
            {error ? error.message : "The note you're looking for doesn't exist or has been deleted."}
          </p>
          <div className="mb-4 text-sm text-gray-600">
            <p>Note ID: {noteId || 'Not found'}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="container mx-auto p-6">
        <StudyBreadcrumb note={note} />
      </div>
      <NoteStudyView note={note} />
      
      {/* AI Chat Toggle Button */}
      <NoteChatToggle 
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
      
      {/* AI Chat Sidebar */}
      {isChatOpen && (
        <NoteChatSidebar 
          note={note}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

const NoteStudyPage = () => {
  return (
    <FlashcardProvider>
      <OptimizedNotesProvider>
        <NoteStudyPageContent />
      </OptimizedNotesProvider>
    </FlashcardProvider>
  );
};

export default NoteStudyPage;
