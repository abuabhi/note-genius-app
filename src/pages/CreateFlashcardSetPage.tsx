
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import CreateFlashcardSet from '@/components/flashcards/CreateFlashcardSet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

const CreateFlashcardSetPage = () => {
  useRequireAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to flashcards page after successful creation
    navigate('/flashcards');
  };

  const handleBack = () => {
    navigate('/flashcards');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-mint-600 hover:text-mint-700 hover:bg-mint-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flashcards
              </Button>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-blue-500 rounded-2xl mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-mint-900 mb-3">
                Create Your First Flashcard Set
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Start building your study collection! Create organized flashcard sets to help you master any subject.
              </p>
            </div>

            {/* Create Form */}
            <div className="max-w-2xl mx-auto">
              <CreateFlashcardSet onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateFlashcardSetPage;
