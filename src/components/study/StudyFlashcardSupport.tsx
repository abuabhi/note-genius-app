
import { useEffect, useState } from 'react';
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
  // We don't need to wrap with FlashcardProvider here as it's already provided at the app level
  return (
    <>
      <StudyFlashcardSupport sessionId={sessionId} flashcardSetId={flashcardSetId} />
      {children}
    </>
  );
};
