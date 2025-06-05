
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { FlashcardProvider } from '@/contexts/FlashcardContext';
import EnhancedFlashcardSetsList from '@/components/flashcards/EnhancedFlashcardSetsList';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { BookOpen } from 'lucide-react';

const FlashcardsPage = () => {
  const [searchParams] = useSearchParams();
  const fromNoteConversion = searchParams.get('from') === 'note-conversion';

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Flashcards" pageIcon={<BookOpen className="h-3 w-3" />} />
        <FlashcardProvider>
          <EnhancedFlashcardSetsList />
        </FlashcardProvider>
      </div>
    </Layout>
  );
};

export default FlashcardsPage;
