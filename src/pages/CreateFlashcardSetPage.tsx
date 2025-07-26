
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import CreateFlashcardSet from '@/components/flashcards/CreateFlashcardSet';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { BookOpen } from 'lucide-react';
import { FlashcardProvider } from '@/contexts/flashcards/index.tsx';

const CreateFlashcardSetPage = () => {
  useRequireAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to flashcards page after successful creation
    navigate('/flashcards');
  };

  const breadcrumbs = [
    { label: "Flashcards", href: "/flashcards" },
    { label: "Create Set" }
  ];

  return (
    <Layout>
      <FlashcardProvider>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <StandardPageHeader
            title="Create Your First Flashcard Set"
            description="Start building your study collection! Create organized flashcard sets to help you master any subject."
            icon={<BookOpen className="h-6 w-6 text-white" />}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto">
              <CreateFlashcardSet onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default CreateFlashcardSetPage;
