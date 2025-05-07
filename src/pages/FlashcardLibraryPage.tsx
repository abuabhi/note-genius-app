
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { LibraryCatalog } from "@/components/library/LibraryCatalog";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { Separator } from "@/components/ui/separator";

const FlashcardLibraryPage = () => {
  const { userProfile } = useRequireAuth();
  const [filters, setFilters] = useState({
    subject: "",
    gradeLevel: "",
    difficulty: "",
  });

  const defaultTier = UserTier.SCHOLAR;
  const currentUserTier = userProfile?.user_tier || defaultTier;

  return (
    <Layout>
      <FlashcardProvider>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Flashcard Library</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <LibraryFilters filters={filters} setFilters={setFilters} />
            </div>
            
            <div className="md:col-span-3">
              <LibraryCatalog
                filters={filters}
                userTier={currentUserTier}
              />
            </div>
          </div>
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default FlashcardLibraryPage;
