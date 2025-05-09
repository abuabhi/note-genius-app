
import { useEffect } from 'react';
import { FlashcardProvider } from '@/contexts/FlashcardContext';

interface StudyFlashcardSupportProps {
  sessionId: string | null;
  flashcardSetId: string | null;
}

export const StudyFlashcardSupport = ({ sessionId, flashcardSetId }: StudyFlashcardSupportProps) => {
  // This component only provides FlashcardContext to components that need it
  // Implement actual logic for studying with flashcards here if needed
  
  return null;
};

export const StudyFlashcardSupportWrapper = ({ children, sessionId, flashcardSetId }: {
  children: React.ReactNode;
  sessionId: string | null;
  flashcardSetId: string | null;
}) => {
  return (
    <FlashcardProvider>
      <StudyFlashcardSupport sessionId={sessionId} flashcardSetId={flashcardSetId} />
      {children}
    </FlashcardProvider>
  );
};
