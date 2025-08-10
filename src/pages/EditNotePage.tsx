
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedNoteStudy } from "@/hooks/notes/useOptimizedNoteStudy";
import { LoadingState } from "@/components/notes/page/LoadingState";
import { ErrorState } from "@/components/notes/page/ErrorState";
import EditNoteContent from "@/components/notes/page/EditNoteContent";
import { UsageLimitBanner } from "@/components/ui/UsageLimitBanner";
import { useAiEnrichmentUsage } from "@/hooks/usage/useAiEnrichmentUsage";
import { useUserTier } from "@/hooks/useUserTier";

const EditNotePage = () => {
  const { noteId } = useParams();
  
  // Ensure user is authenticated
  useRequireAuth();

  // Use optimized data fetching
  const { note, isLoading, error } = useOptimizedNoteStudy(noteId || '');
  const { userTier } = useUserTier();
  const { usageCount, monthlyLimit } = useAiEnrichmentUsage();

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
      {monthlyLimit !== null && userTier && (
        <UsageLimitBanner
          currentTier={userTier}
          feature="AI Enhancements"
          usedCount={usageCount}
          limit={monthlyLimit}
          className="mb-4"
        />
      )}
      <EditNoteContent note={note} />
    </Layout>
  );
};

export default EditNotePage;
