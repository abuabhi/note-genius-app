
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
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <EnhancedFlashcardSetView />
        </div>
      </Layout>
    </FlashcardProvider>
  );
};

export default FlashcardSetPage;
