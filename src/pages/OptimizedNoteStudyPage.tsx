
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from "react";
import Layout from "@/components/layout/Layout";
import { NoteProvider } from "@/contexts/NoteContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

// Lazy load the study view component
const NoteStudyView = lazy(() => import("@/components/notes/study/NoteStudyView").then(module => ({
  default: module.NoteStudyView
})));

// Loading skeleton component
const StudyLoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-mint-50/20">
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OptimizedNoteStudyPageInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);

  // Require authentication
  useRequireAuth();

  // Optimized note loading with caching
  useEffect(() => {
    const loadNote = async () => {
      if (!id) {
        setError("No note ID provided");
        setLoading(false);
        return;
      }

      console.log("🔍 Loading note for study:", id);

      try {
        // Try to load from cache first
        const cacheKey = `note_${id}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const cachedNote = JSON.parse(cached);
          console.log("📦 Loaded note from session cache");
          setNote(cachedNote);
          setLoading(false);
          return;
        }

        // Fetch from database with optimized query
        const { data: noteData, error: fetchError } = await supabase
          .from('notes')
          .select(`
            id, title, description, content, created_at, subject, 
            source_type, archived, pinned, subject_id,
            summary, summary_status, summary_generated_at,
            key_points, key_points_generated_at,
            markdown_content, markdown_content_generated_at,
            improved_content, improved_content_generated_at
          `)
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error("❌ Error fetching note:", fetchError);
          setError("Failed to load note");
          setLoading(false);
          return;
        }

        if (!noteData) {
          setError("Note not found");
          setLoading(false);
          return;
        }

        // Transform to Note type
        const transformedNote: Note = {
          id: noteData.id,
          title: noteData.title || "Untitled",
          description: noteData.description || "",
          content: noteData.content || noteData.description || "",
          date: new Date(noteData.created_at).toISOString().split('T')[0],
          category: noteData.subject || "Uncategorized",
          sourceType: (noteData.source_type as 'manual' | 'scan' | 'import') || 'manual',
          archived: noteData.archived || false,
          pinned: noteData.pinned || false,
          subject_id: noteData.subject_id,
          tags: [],
          summary: noteData.summary,
          summary_status: (noteData.summary_status as 'pending' | 'generating' | 'completed' | 'failed') || 'pending',
          summary_generated_at: noteData.summary_generated_at,
          key_points: noteData.key_points,
          key_points_generated_at: noteData.key_points_generated_at,
          markdown_content: noteData.markdown_content,
          markdown_content_generated_at: noteData.markdown_content_generated_at,
          improved_content: noteData.improved_content,
          improved_content_generated_at: noteData.improved_content_generated_at
        };

        console.log("✅ Note loaded successfully:", transformedNote.title);
        
        // Cache in session storage for faster subsequent loads
        sessionStorage.setItem(cacheKey, JSON.stringify(transformedNote));
        
        setNote(transformedNote);
        setError(null);
        setLoading(false);
        
      } catch (err) {
        console.error("❌ Unexpected error loading note:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    loadNote();
  }, [id]);

  const handleGoBack = () => {
    navigate('/notes');
  };

  if (loading) {
    return (
      <Layout>
        <StudyLoadingSkeleton />
      </Layout>
    );
  }

  if (error || !note) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              {error || "Note Not Found"}
            </h2>
            <p className="mb-4 text-red-600">
              {error || "The note you're looking for doesn't exist or has been deleted."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleGoBack}>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<StudyLoadingSkeleton />}>
        <NoteStudyView note={note} />
      </Suspense>
    </Layout>
  );
};

const OptimizedNoteStudyPage = () => {
  return (
    <NoteProvider>
      <OptimizedNoteStudyPageInner />
    </NoteProvider>
  );
};

export default OptimizedNoteStudyPage;
