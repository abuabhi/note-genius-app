
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedNoteStudy } from "@/hooks/notes/useOptimizedNoteStudy";
import { LoadingState } from "@/components/notes/page/LoadingState";
import { ErrorState } from "@/components/notes/page/ErrorState";
import EditNoteContent from "@/components/notes/page/EditNoteContent";

const EditNotePage = () => {
  const { noteId } = useParams();
  
  // Ensure user is authenticated
  useRequireAuth();

  // Use optimized data fetching
  const { note, isLoading, error } = useOptimizedNoteStudy(noteId || '');

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Loading note..." />
      </Layout>
    );
  }

  if (error || !note) {
    return (
      <Layout>
        <ErrorState />
      </Layout>
    );
  }

  return (
    <Layout>
      <EditNoteContent note={note} />
    </Layout>
  );
};

export default EditNotePage;
