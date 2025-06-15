
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { LibraryCatalog } from "@/components/library/LibraryCatalog";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { Library } from "lucide-react";

const FlashcardLibraryPage = () => {
  const { userProfile } = useRequireAuth();
  const [filters, setFilters] = useState({
    subject: "_all",
    gradeLevel: "_all",
    difficulty: "_all",
  });

  const defaultTier = UserTier.SCHOLAR;
  const currentUserTier = userProfile?.user_tier || defaultTier;

  const breadcrumbs = [
    { label: "Flashcard Library" }
  ];

  return (
    <Layout>
      <FlashcardProvider>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <StandardPageHeader
            title="Flashcard Library"
            description="Browse and access our comprehensive collection of study materials"
            icon={<Library className="h-6 w-6 text-white" />}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="container mx-auto px-6 py-8">
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
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default FlashcardLibraryPage;
