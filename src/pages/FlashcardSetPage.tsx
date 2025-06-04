
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import EnhancedFlashcardSetView from "@/components/flashcards/EnhancedFlashcardSetView";

const FlashcardSetPage = () => {
  useRequireAuth();
  
  return (
    <Layout>
      <EnhancedFlashcardSetView />
    </Layout>
  );
};

export default FlashcardSetPage;
