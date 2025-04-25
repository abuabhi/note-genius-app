
import Layout from "@/components/layout/Layout";
import FlashcardsList from "@/components/flashcards/FlashcardsList";

const FlashcardsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Flashcards</h1>
        <FlashcardsList />
      </div>
    </Layout>
  );
};

export default FlashcardsPage;

