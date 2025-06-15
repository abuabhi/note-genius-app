
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { Button } from "@/components/ui/button";
import { NoteStudyView } from "@/components/notes/study/NoteStudyView";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

const NoteStudyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote } = useOptimizedNotes();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);

  // Require authentication
  useRequireAuth();

  // Debug logging
  useEffect(() => {
    console.log("🔍 NoteStudyPage Debug Info:", {
      id,
      pathname: window.location.pathname,
      search: window.location.search
    });
  }, [id]);

  // Try to find note in context first, then fetch from database if needed
  useEffect(() => {
    const loadNote = async () => {
      if (!id) {
        console.error("❌ No note ID found in params");
        setError("No note ID provided");
        setLoading(false);
        return;
      }

      console.log("🔍 Looking for note with ID:", id);
      console.log("📝 Available notes in context:", notes.length);

      // First check if note exists in context
      let foundNote = notes.find(n => n.id === id);
      
      if (foundNote) {
        console.log("✅ Found note in context:", foundNote.title);
        setNote(foundNote);
        setError(null);
        setLoading(false);
        return;
      }

      // If not in context, try to fetch directly from database
      console.log("🔄 Note not in context, fetching from database...");
      
      try {
        const { data: noteData, error: fetchError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error("❌ Error fetching note:", fetchError);
          if (fetchError.code === 'PGRST116') {
            setError("Note not found - it may have been deleted");
          } else {
            setError("Failed to load note from database");
          }
          setLoading(false);
          return;
        }

        if (!noteData) {
          console.log("❌ No note data returned");
          setError("Note not found");
          setLoading(false);
          return;
        }

        // Transform database note to our Note type
        const transformedNote: Note = {
          id: noteData.id,
          title: noteData.title || "Untitled",
          description: noteData.description || "",
          content: noteData.content || noteData.description || "",
          date: new Date(noteData.created_at).toISOString().split('T')[0],
          subject: noteData.subject || "Uncategorized",
          sourceType: (noteData.source_type as 'manual' | 'scan' | 'import') || 'manual',
          archived: noteData.archived || false,
          pinned: noteData.pinned || false,
          subject_id: noteData.subject_id,
          tags: [], // Database response doesn't include tags, will be empty for now
          // Enhancement fields
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

        console.log("✅ Successfully fetched and transformed note:", transformedNote.title);
        
        setNote(transformedNote);
        setError(null);
        setLoading(false);
        
        // Add to notes context to avoid future fetches
        try {
          await addNote(transformedNote);
        } catch (addError) {
          console.log("Note already exists in context or failed to add:", addError);
        }
        
      } catch (err) {
        console.error("❌ Unexpected error fetching note:", err);
        setError("An unexpected error occurred while loading the note");
        setLoading(false);
      }
    };

    loadNote();
  }, [id, notes, addNote]);

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
            <div className="mb-4 text-sm text-gray-600">
              <p>URL ID: {id || 'Not found'}</p>
              <p>Available notes: {notes.length}</p>
              <p className="mt-2 text-green-600">
                The database has been reset to provide a fresh start. Please create new notes to continue.
              </p>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <NoteStudyView note={note} />
    </Layout>
  );
};

export default NoteStudyPage;
