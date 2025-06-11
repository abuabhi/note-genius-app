
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import EnhancedFlashcardSetView from "@/components/flashcards/EnhancedFlashcardSetView";
import { FlashcardProvider } from "@/contexts/FlashcardContext";

const FlashcardSetPage = () => {
  useRequireAuth();
  
  console.log("FlashcardSetPage: Component rendered");
  
  return (
    <FlashcardProvider>
      <Layout>
        <EnhancedFlashcardSetView />
      </Layout>
    </FlashcardProvider>
  );
};

export default FlashcardSetPage;
