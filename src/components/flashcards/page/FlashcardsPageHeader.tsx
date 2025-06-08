
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { BookOpen, Plus } from 'lucide-react';

interface FlashcardsPageHeaderProps {
  loading: boolean;
}

export const FlashcardsPageHeader = ({ loading }: FlashcardsPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <PageBreadcrumb pageName="Flashcards" pageIcon={<BookOpen className="h-3 w-3" />} />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-mint-800">Flashcard Sets</h1>
          <p className="text-muted-foreground">
            Study with your personalized flashcard collections
          </p>
        </div>
        <Button 
          onClick={() => navigate('/flashcards/create')}
          className="bg-mint-500 hover:bg-mint-600"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Set
        </Button>
      </div>
    </>
  );
};
