
import { useEffect, useState } from 'react';
import { FlashcardProvider } from '@/contexts/FlashcardContext';
import { useToast } from '@/hooks/use-toast';

interface StudyFlashcardSupportProps {
  sessionId: string | null;
  flashcardSetId: string | null;
}

export const StudyFlashcardSupport = ({ sessionId, flashcardSetId }: StudyFlashcardSupportProps) => {
  const { toast } = useToast();
  const [hasError, setHasError] = useState(false);

  // This component only provides FlashcardContext to components that need it
  // Implement actual logic for studying with flashcards here if needed
  
  useEffect(() => {
    // If there was an error in the flashcard provider, we can handle it here
    return () => {
      if (hasError) {
        setHasError(false);
      }
    };
  }, [hasError]);
  
  return null;
};

export const StudyFlashcardSupportWrapper = ({ children, sessionId, flashcardSetId }: {
  children: React.ReactNode;
  sessionId: string | null;
  flashcardSetId: string | null;
}) => {
  // Wrap the children with the FlashcardProvider, with proper error handling
  return (
    <FlashcardProvider>
      <StudyFlashcardSupport sessionId={sessionId} flashcardSetId={flashcardSetId} />
      {children}
    </FlashcardProvider>
  );
};
