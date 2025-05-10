
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useNotes } from "@/contexts/NoteContext";
import { Button } from "@/components/ui/button";
import { NoteStudyView } from "@/components/notes/study/NoteStudyView";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const NoteStudyPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { notes } = useNotes();
  const [loading, setLoading] = useState(true);
  useRequireAuth();

  const note = notes.find(n => n.id === noteId);

  useEffect(() => {
    if (notes.length > 0) {
      setLoading(false);
    }
  }, [notes]);

  const handleGoBack = () => {
    navigate('/notes');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
            <p className="mt-2 text-muted-foreground">Loading note...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Note Not Found</h2>
            <p className="mb-4 text-red-600">
              The note you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={handleGoBack}>
              Back to Notes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={handleGoBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
        </div>

        <NoteStudyView note={note} />
      </div>
    </Layout>
  );
};

export default NoteStudyPage;
